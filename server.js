const WebSocket = require('ws');
const readline = require('readline');

const server = new WebSocket.Server({ port: 8080 });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('✅ Server berjalan di ws://localhost:8080');
console.log('💬 Ketik pesan di terminal untuk broadcast ke semua client');
console.log('🤖 Server akan membalas: halo, ping, help\n');

function broadcastToAll(message) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

rl.on('line', (input) => {
    if (input === 'exit') process.exit(0);
    const pesan = JSON.stringify({ nama: 'Admin', pesan: input });
    broadcastToAll(pesan);
    console.log(`[Broadcast] ${input}`);
});

server.on('connection', (socket) => {
    console.log('🔗 Client terhubung');
    
    socket.send(JSON.stringify({ nama: 'Server', pesan: 'Selamat datang! Kirim halo, ping, atau help.' }));

    socket.on('message', (raw) => {
        console.log('📩 Raw message:', raw);
        try {
            const data = JSON.parse(raw);
            console.log('Parsed:', data);
            
            // Balasan otomatis
            if (data.pesan.toLowerCase().includes('halo')) {
                socket.send(JSON.stringify({ nama: 'Server', pesan: 'Halo juga!' }));
                console.log('✅ Balasan "halo" terkirim');
            } else if (data.pesan.toLowerCase().includes('ping')) {
                socket.send(JSON.stringify({ nama: 'Server', pesan: 'pong!' }));
                console.log('✅ Balasan "ping" terkirim');
            } else if (data.pesan.toLowerCase().includes('help')) {
                socket.send(JSON.stringify({ nama: 'Server', pesan: 'Perintah: halo, ping, help' }));
                console.log('✅ Balasan "help" terkirim');
            }
            
            // Broadcast ke client lain
            server.clients.forEach(client => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(raw);
                }
            });
        } catch(e) {
            console.log('Error parsing JSON:', e.message);
        }
    });

    socket.on('close', () => {
        console.log('❌ Client putus');
        broadcastToAll(JSON.stringify({ nama: 'Sistem', pesan: 'User keluar' }));
    });
});
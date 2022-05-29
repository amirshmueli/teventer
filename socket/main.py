import socket
import threading

HOST = "0.0.0.0"
PORT = 80
ADDR = (HOST, PORT)

REDIRECTION_URL = "https://127.0.0.1/"
REDIRECTION_HTTP = f'HTTP/1.1 301 Moved Permanently\r\nLocation: {REDIRECTION_URL}\r\n\r\n'


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(ADDR)
    server_socket.listen()
    print(f'starting server on {HOST}:{PORT}')
    while True:
        client_sock, _ = server_socket.accept()
        client_thread = threading.Thread(target=handle_request,
                                         args=(client_sock, ))
        client_thread.start()


def handle_request(conn):
    print(">>> Connected")
    req = http_rcv(conn)
    conn.send(REDIRECTION_HTTP.encode())


def http_rcv(sock):
    data = b''
    length = 0
    while not data[-4:] == b'\r\n\r\n':
        _d = sock.recv(1)
        if _d != b'':
            data += _d
        else:
            return b''
    headers = data.decode('utf8')
    if "Content-Length:" in headers:
        headers2 = headers.split('\r\n')
        for h in headers2:
            if h.startswith("Content-Length:"):
                value = h.split(': ')
                length = int(value[1])
    body = b''
    while len(body) < length:
        _d = sock.recv(length - len(body))
        if _d != b'':
            body += _d
        else:
            return b''

    return data.decode() + body.decode()


if __name__ == "__main__":
    main()
package services

import (
	"bytes"
	"fmt"
	"io"
	"net"
)

const REDIRECT = "https://127.0.0.1"

// port is :X
func RunSocket(port string) {
	ln, err := net.Listen("tcp", port)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("Socket Listening On " + port)

	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println(err)
			continue
		}
		fmt.Println("Connection Established on " + conn.LocalAddr().String())

		fmt.Println("<<< START:RECV")
		_, err = recvHTTP(conn)
		fmt.Println("<<< STOP:RECV")

		if err != nil && err != io.EOF {
			fmt.Println("was error")
			fmt.Println(err)

			conn.Close()
		} else {
			fmt.Println("redirecting...")
			conn.Write([]byte("HTTP/1.1 301 Moved Permanently\r\nLocation: https://localhost:443/\r\nContent-Type: text/html\r\nContent-Length: 174\r\n\r\n"))
			b, e := recvHTTP(conn)
			if e != nil {

			}
			fmt.Println(b)
			conn.Close()
		}

	}
}

func recvHTTP(conn net.Conn) ([]byte, error) {
	var data []byte = []byte("aaaa")

	for !bytes.Equal(data[len(data)-4:], []byte("\r\n\r\n")) {
		var d = make([]byte, 1)
		_, err := conn.Read(d)
		if err != nil {
			return nil, err
		}
		data = append(data, d...)
	}
	return data, nil
}

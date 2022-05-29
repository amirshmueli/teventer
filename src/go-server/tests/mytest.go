package main

import (
	"fmt"
	"net"
)

func test() {
	ln, err := net.Dial("tcp", "127.0.0.1:123")
	if err != nil {
		fmt.Println(err)
		return
	}

	ln.Write([]byte("amir shmueli \r\n\r\n"))
	fmt.Scanln()
}

func main() {
	test()
}

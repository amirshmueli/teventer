package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
)

const SecretKey = "secret"

func authRequest(tokenString string) (int, bool, string) {

	claims := &jwt.StandardClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})

	fmt.Println("\t Token Validation")

	// validation
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			fmt.Println("\t ERROR: Token Signature Invalid")
			return http.StatusUnauthorized, false, ""
		} else {
			fmt.Println("\t ERROR: Token Bad Parse")
			fmt.Printf("\t %s\n", err)
		}
		return http.StatusBadRequest, false, ""
	}

	if !token.Valid {
		fmt.Println("\t ERROR: Token Invalid")
		return http.StatusBadRequest, false, ""
	}

	fmt.Printf("\t Token Authenticated for %s\n", claims.Issuer)

	return 0, true, claims.Issuer
}

func Authenticate(w http.ResponseWriter, token string) string {
	fmt.Printf("\t Authenticating [%s] \n", token)
	header, pass, auth_issuer := authRequest(token)
	if !pass {
		w.WriteHeader(header)
		fmt.Println("\t Authentication Failed")
		return ""
	}
	return auth_issuer
}

func CreateToken(issuer string) (string, error) {
	var expirationTime = time.Now().Add(time.Hour * 2)

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    issuer,
		ExpiresAt: expirationTime.Unix(),
	})

	return claims.SignedString([]byte(SecretKey))
}

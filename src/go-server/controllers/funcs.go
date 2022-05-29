package controllers

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
)

func ParseRequest(r *http.Request) (map[string]interface{}, error) {
	buf, _ := ioutil.ReadAll(r.Body)
	r.Body = ioutil.NopCloser(bytes.NewBuffer(buf))

	var a map[string]interface{}
	if err := json.NewDecoder(ioutil.NopCloser(bytes.NewBuffer(buf))).Decode(&a); err != nil {
		return nil, err
	}
	return a, nil

}

func ExtractToken(x map[string]interface{}) string {
	return x["token"].(string)
}

// Package config
// D-ETCIF-backend/configs/config.go
package config

import (
	"os"

	"D-ETCIF-backend/pkg/utils"

	"github.com/spf13/viper"
)

var Config *Conf

type Conf struct {
	Server  *Server  `yaml:"server"`
	Mysql   *Mysql   `yaml:"mysql"`
	Neo4j   *Neo4j   `yaml:"neo4j"`
	Python  *Python  `yaml:"python"`
	Migrate *Migrate `yaml:"migrate"`
}

type Server struct {
	Version string `yaml:"version"`
	Host    string `yaml:"host"`
	Port    string `yaml:"port"`
}

type Mysql struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	UserName string `yaml:"username"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`
	Charset  string `yaml:"charset"`
}

type Neo4j struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	UserName string `yaml:"username"`
	Password string `yaml:"password"`
}

type Python struct {
	BaseURL string `yaml:"baseurl"`
}

type Migrate struct {
	Auto                      bool   `yaml:"auto"`
	UserDataPath              string `yaml:"userdatapath"`
	ExperimentDetailsDataPath string `yaml:"experimentdetailsdatapath"`
}

func init() {
	workDir, _ := os.Getwd()
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(workDir + "/configs")
	utils.Info("加载配置文件:", workDir+"/configs/config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}
	err = viper.Unmarshal(&Config)
	if err != nil {
		panic(err)
	}
}

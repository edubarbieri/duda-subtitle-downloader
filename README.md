# duda-subtitle-downloader
Duda subtitle downloader.

Este script percorre a pasta configurada e suas subpastas, verificando se os arquivos são videos e realiza o download da legenda apropriada para cada.

Em um primeiro momento é buscado a legenda no opensubtitle a partir do hash do vídeo, caso não seja encontrada legenda correspondente, é então realizado query por nome do arquivo, e baixado as primeiras legendas encontradas.

Videos que já possuem legendas são ignorados.


## Requisitos:
Nodejs 6

## Instalação dependências
```bash
cd duda-subtitle-downloader
npm install
```
## Execução
```
node index.js
```



## Configurações

config.json

```javascript
{
	//Configurações da conta, necessario criar uma conta no www.opensubtitles.org
	"opensubtitles": {
		"useragent": "Nodejs",
		"username": "youremail@gmail.com",
		"password": "yourpassword"
	},
	//Pasta que sera analisada para download das legendas
	"folderToScan": "/u01/media/TV Shows",
	
	//"Formatos de videos suportados
	"videoFormats": [
		".mp4",
		".mkv",
		".avi",
		".wmv",
		".mpg",
		".mpeg"
	],
	//Idioma das legendas
	"language": "pob",
	//Numero de legendas baixadas na pesquisa por nome
	"limit": "3"
}
```

 - TODO:
	 - Ignorar busca de legendas baixadas por nome.
	 - Implementar regra de identificação do episodio por expressão regular.



## License
Copyright (c) 2017 Edu Barbieri
Licensed under the WTFPL license.

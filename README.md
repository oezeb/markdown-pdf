# markdown-pdf README

Markdown PDF help convert Markdown files into PDF using [pandoc](https://pandoc.org/) with CJK(Chinese, Japanese, and Korean) languages supported. 

The extension create `YAML metadata file`(metadata.yaml) where it list the basics of the template that [pandoc](https://pandoc.org/) will be using. The YAML file can be edited by the user to fit his needs.

## Requirements

- Install latest [pandoc](https://github.com/jgm/pandoc/releases) and add to System environment PATH variable
- Install LaTEX using [TEX Live](https://www.tug.org/texlive/) or [MiKETeX](https://miktex.org/)

## Features

The extension include 5 commands:

+ `Use default template` discard any existing YAML and use the extension's predefined template to generate PDF.

+ `Generate (will merge with template if any!!!)` look for any updates in the YAML file to override or add to the basic template properties then generate PDF.

+ `Add Title, Authors and Date to the document`. This command also merge user's updates made in the YAML file.

+ `Add Table of Contents to the document`. This command also merge user's updates made in the YAML file.

+ `Add Title, Authors, Date and  Table of Contents to the document`. This command also merge user's updates made in the YAML file.

See [samples](https://github.com/oezeb/markdown-pdf/tree/main/samples)
![cutie](https://github.com/oezeb/markdown-pdf/tree/main/samples/sample-1.png)

## Release Notes

### 0.0.4 Added and modified commands. Now a total of 5 commands available.

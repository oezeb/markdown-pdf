<!-- http://www.unexpected-vortices.com/sw/rippledoc/quick-markdown-example.htm -->

Here's a link to [markdown-pdf](https://github.com/oezeb/markdown-pdf.git), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h3-header). Here's a footnote [^1].

Pandoc supports multi-line tables:

--------  -----------------------
Keyword   Text
--------  -----------------------
red       Sunsets, apples, and
          other red or reddish
          things.

绿色      树叶、青草、麦苗、茶叶、
          氯气、青蛙、绿灯、绿豆、
          等。。。
--------  -----------------------

Table: Multi-line table sample

[^1]: Some footnote text.

images can be specified like so:     

![猫咪](cute-cate.jpg "A cute cat"){width=128px}

```cpp
#include <iostream>

using namespace std;

int main() {
  cout << "Hello World" << endl;
  return 0;
}
```
A horizontal rule follows.

***

Inline math equation: $\omega = d\phi / dt$. Display
math should get its own line like so:

$$字母 I = \int \rho R^{2} dV$$
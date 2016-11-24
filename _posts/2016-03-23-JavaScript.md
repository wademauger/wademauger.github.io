---
layout: post
title:  "A Reflection on the Design of JavaScript"
date:   2016-11-23
banner_image: js.jpg
tags: [web development, JavaScript, ES2015]
---

There's no denying that JavaScript has a lot going for it- it's native
integration with the now common JSON text format alone makes NodeJS a 
compelling option for your next REST server. However, I've recently
found myself in a few conversations about why the language and interpreter
are designed the way they are, and I think it's time I write down my
opinions.

<!--more-->

Out of the discussions I've had with my friends and co-workers, I've gathered
that there are two primary goals of the JavaScript language and runtime:

# JavaScript is designed to be *fast*.

Like, really fast. There are plenty of comparison of languages' performances,
but I particular like [this one][comparison]. Even though the test they ran is
a little arbitrary and unrealistic, its analysis seems pretty thorough and
compares a wide variety of runtimes, even pitting Chrome / NodeJS's V8 against
Mozilla Firefox's SpiderMonkey. Notably, as this writer mentions, according to
their data,

> Javascript V8 completed [this] test slightly faster than C++.

Of course it's important that a language is fast- speed can make the difference
between community adoption and abandonment. In order to achieve this speed, the 
JS interpreter cuts some corners, resulting in some odd, yet still valid syntaxes:

{% highlight javascript %}

  1.toString();
  // SyntaxError: Invalid or unexpected token

  const foo = 1;
  foo.toString();
  // "1"

  1.0.toString();
  // "1"

  1..toString();
  // "1"

{% endhighlight %}

Because the JavaScript runtime doesn't look ahead for context like other languages'
interpreters, the Number literal on the first line could either be an integer, or
a decimal. The interpreter hasn't made it's mind up yet, so SyntaxError it is. That
takes us into the next (and argauably the secondary of the two) design goal of
JavaScript:

# JavaScript is designed to *always run*.

There's one particular part of JavaScript that supports this philosopy: coersion.
Where other languages would crash and burn, JavaScript defaults to an implicit
result, and keeps on chugging. If you're not familiar with coersion, Kyle Simpson
describes them in depth in his [You Don't Know JavaScript][coersion]. Sure, most
languages have some implicit "gotchas" somewhere along the way, but trying to
remember how things get coersed can be tedious at first, and in my experience,
it never stops feeling hacky.



You get the point.

[comparison]: http://raid6.com.au/~onlyjob/posts/arena/
[coersion]: https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md

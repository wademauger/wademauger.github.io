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
found myself in a few conversations about why the language and interperter
are designed the way they are, and I think it's time I speak up about
one particular aspect that bothers me.

<!--more-->

Out of the discussions I've had with my friends and co-workers, there
are two primary goals of the JavaScript language and runtime:

# JavaScript is designed to be *fast*.

Like, really fast. There are plenty of comparison of languages' performances,
but I particular like [this one][comparison]. It seems pretty thorough and
compares a wide variety of runtimes, even pitting Chrome / NodeJS's V8 against
Mozilla Firefox's SpiderMonkey. Notably, as this writer mentions, according to
their data,

> Javascript V8 completed [this] test slightly faster than C++.

You can find plenty of other examples of the speed of JavaScript online, but
that's not the point.

# JavaScript is designed to *always run*.

There's one particular part of JavaScript that supports this philosopy: coersion.
Where other languages would crash and burn, JavaScript defaults to an implicit
result, and keeps on chugging. Sure, most languages have some implicit "gotchas"
somewhere along the way, but trying to remember how things get coersed can be
tedious at first, and in my experience, it never stops feeling hacky.

{% highlight javascript %}

class myClass {
  const util = () => {
    return [1, 2, 3, 4, 5].map(el => {
      return el === 3;
    });
  };
}

{% endhighlight %}

You get the point.

[comparison]: http://raid6.com.au/~onlyjob/posts/arena/
[coersion]: https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md

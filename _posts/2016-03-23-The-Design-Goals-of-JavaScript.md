---
layout: post
title:  "The Design Goals of JavaScript"
date:   2016-11-23
banner_image: js.jpg
tags: [web development, JavaScript, ES2015]
comments: true
---

There's no denying that JavaScript has a lot going for it- its native
integration with the now common JSON text format alone makes NodeJS a 
compelling option for your next REST server. However, I've recently
found myself in a few conversations about why the language and interpreter
are designed the way they are, and I think it's time I write down my
opinions.

<!--more-->

Out of the discussions I've had with my friends and co-workers, I've gathered
that there are two primary goals in the design of the JavaScript language and runtime:

# JavaScript is designed to be *fast*.

Like, really fast. There are plenty of comparisons of languages' performances,
but I particularly like [this one][comparison] (Even though the test they ran is
a little arbitrary and unrealistic, its analysis seems pretty thorough and
compares a wide variety of runtimes, even pitting Chrome / NodeJS's V8 against
Mozilla Firefox's SpiderMonkey). Notably, as this writer mentions, according to
their data,

> Javascript V8 completed [this] test slightly faster than C++.

That's pretty impressive. Of course it's important that a language is designed to 
be fast- speed can make the difference between community adoption and abandonment.
In order to achieve this speed, the  JS interpreter cuts some corners, resulting
in some odd, yet still valid syntaxes:

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
interpreters, the Number literal in the first example could either be an integer, or
a decimal. The interpreter hasn't made up it's mind yet, so it just defaults to a
SyntaxError . That takes us into the next (and argauably the secondary of the two)
design goal of JavaScript:

# JavaScript is designed to *always run*.

There's one particular part of JavaScript that supports this philosopy: coersion.
Where other languages would crash and burn, JavaScript defaults to an implicit
result, and keeps on chugging. If you're not familiar with coersion, Kyle Simpson
describes them in depth in his [You Don't Know JavaScript][coersion]. Basically,
it looks like this:

{% highlight javascript %}

  console.log(1 + 2);
  // 3, just like you would expect in any language

  console.log('1' + '2');
  // '12', Strings get concatonated with the + operator

  /*
   * But what happens when we try to add the Number 1
   * with the String '2'?
   */
   console.log(1 + '2');
   // '12', wait wut?

{% endhighlight %}

When you try to add a Number to a String, the number gets cast to a String, and then
the two get concatonated together-- and it doesn't stop there, an implicit casting
exists for pretty much any two types. This allows your JavaScript to continue running where
other interpreters and compilers would stop and say, "Yeah, I don't think you wanted to do that. I don't know
what to do here". Sure, most languages have some implicit "gotchas" somewhere along
the way, but trying to remember how things get coersed can be tedious at first, and
in my experience, using coersions never stops feeling hacky. More often than not, it's
something you try to avoid using, and leads to cryptic behavior and errors on occasion.

# Where's the line between speed and tolerance?

While it's nice to know that my script won't stop running because of a `TypeError` tucked away in
an `if` block that I happened to miss in my unit tests, it's not like you're at all *guaranteed*
that your entire script will get executed. For example, when the following script gets run, the
first `console.log` gets written, but the second does not:


{% highlight javascript %}

  console.log('JavaScript is an');
  const foo = undefined.data;
  console.log('awesome language!');

{% endhighlight %}

Instead we get

{% highlight javascript %}

  JavaScript is an
  Uncaught TypeError: Cannot read property 'apple' of undefined

{% endhighlight %}

So, what's the point of all the added complexity of type coersion if the runtime safety
is so limited? `undefined` pops up everywhere in JavaScript- anytime you access an uninitialized
variable, a member of an object that hasn't been set, or an index of an Array that was never
assigned to, you get `undefined`. Dealing with `undefined` is easy enough in small applications,
but when you start dealing with larger structures, it becomes harder and harder to gurantee that
you won't hit an edge case where something is `undefined`, and your whole program comes crashing down.
This is such a common problem that the once popular library, [Lodash][lodash], included a function
to gracefully access object members:

{% highlight javascript %}

  // Lodash's get function
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0,
      length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }

  ...

  const _ = require('lodash');
  
  const foo = {
    a: 1,
    b: 2,
    bar: {
      c: 3,
      d: 4
    }
  };

  _.get(foo, 'bar.c');
  // 3

  _.get(foo, 'c.baz');
  // undefined

  var data = foo.c.baz;
  // Uncaught TypeError: Cannot read property 'baz' of undefined

{% endhighlight %}

This gives developers the peace of mind that, should they ever try to access the data on a member of an 
anything undefined, their program would happily move on with out it. So what's the deal, here? Would performance
really take a hit if `undefined.foo` resolved to `undefined`? Should you instead use a `try/catch` block every
time you access the members of an object that you have any shadow of a doubt about?

Would you like to see something like Lodash's get functionality built into native dot
syntax in a future JavaScript spec? Does any code that risks hitting a `TypeError`
indicate something needs refactored? Let me know what you think in the comments below!

{% if page.comments %}

<div id="disqus_thread"></div>
<script>
var disqus_config = function () {
this.page.url = '{{ site.url }}';  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = '{{ page.url }}'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = '//wademauger.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>

{% endif %}

[comparison]: http://raid6.com.au/~onlyjob/posts/arena/
[coersion]: https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md
[lodash]: https://lodash.com/

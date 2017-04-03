---
layout: post
title:  "OTP Applications in Elixir for Webscale"
date:   2016-12-27
banner_image: elixir.jpg
tags: [Web Development, Elixir, Web Scale, OTP]
comments: true
---

Whether you've heard of the Elixir programming language or not, the Beam runtime
that Elixir borrows from Erlang has been tried and tested, and proven its worth
time and again. Tons of success stories have been published with astonishing numbers
from impressive uptimes, to concurrent connections and resource conservative
performance. The Erlang language itself, however, was fairly clunky and scared
off many potentially good development use cases for the runtime's offerings.

<!--more-->

# A condensed history of Elixir

All the way back in the mid 1980's, Ericsson’s Computer Science Laboratory developed
a language and runtime to solve for the distributed, massively concurrent applications
demanded by the telephone industry. With this language, a framework which came to be known as
OTP, or Open Telecom Platform, was developed. This framework followed a supervision tree
architecture, which we will later touch on.

Fast forward a few years to about 2011, and meet the hero of our story, José Valim. José had
been a major contributor to the Rails project, the major web framework built on the Ruby
programming language. He realized that the web was becoming more interactive, requiring
more frequent requests from client to server, and often these interactive sites were using
web sockets, which maintain an open connection between client and server. Rails was able to
work with web sockets, but not without some trickery. Even still, Ruby's concurrency model
was lackluster at best, so he sought to create a new, more capable language.

# Open Telecom Platform

The OTP framework ships along with the erlang virtual machine (BEAM VM) for its original purpose
to manage phone connections. Turns out client-server connections can be modeled similarly.
The main structure of OTP applications is the supervision tree that's built at runtime, which
looks like this:

![OTP Supervision Tree]({{ site.url }}/images/posts/supervisionTree.png)

Here, the leaves of the tree (workers), are started and watched by Supervisor processes, which
are spawned by other Supervisor processes, which are spawned by the Application. There are
a few workers available in the OTP framework, but we'll specifically look at the GenServer
worker, short for "generic server". This should cover most use cases for workers, although other specialized
types of workers are available, such as GenEvent, which is useful for event handling functionality.

# Zero Calorie Processes

The supervision tree is built up of processes that watch other processes, and restart them
when they crash. The BEAM VM has a different construct of processes than the system processes
you're probably used to-- each process extremely light weight, and is added to a pool of
processes when spawned. The virtual machine then figures out how to distribute the work on
each of these processes based on the resources available, allowing you to make use of as all the
cores your cpu has.

Spawning a process is easy- you just call the `spawn` function, and pass it a reference to a
function:

![Spawn Function Call]({{ site.url }}/images/posts/elixir/spawn.png)

The process spins up, calls the function in parallel with the rest of your code execution, and
then dies. Elixir processes also have a great system of communication, by way of message
passing. To open the first message in your process inbox, or wait for the first message to
come in, you call the `receive` block, and pattern match against values you expect to receive:

![Receive Block]({{ site.url }}/images/posts/elixir/recieve.png)

Note the recursive call to `loop`. It's important to call back into the loop function, because
otherwise the function will close out, and the process will close. It's also important to make
sure when you pattern match the message you receive to have a catch all pattern-- either a variable
to bind to, or an underscore to catch all without binding it to anything. If you don't include a 
catch all, unmatched patterns will sit in your mailbox indefinitely, and you can quickly run out
of memory.

As you can kind of see, there's a lot of things to manage when you roll your own processes. GenServer's
interface allows us to implement similar functionality, while abstracting away most of the
caveats elixir processes come with.

# GenServer

The GenServer behavior that ships with elixir provides a bunch of convenience functions that wrap
the BEAM VM's message passing system, and prevent some common mistakes. GenServer outlines three
different kinds of messages that a node should be able to respond to: `call`, `cast`, and `info`.
GenServers are also good for wrapping in-memory state, as we'll see in a later example.

## &GenServer.call/3

A `call` is a synchronous, blocking message. If you expect your GenServer to receive a message asking
you for data back, a `call` is appropriate. here's an example:

![Handle Call]({{ site.url }}/images/posts/elixir/handle_call.png)

According to the [Elixir docs][handle_call_returns], we have a few options of how to structure our
return value for this function:

{% highlight elixir %}
  {:reply, reply, new_state}
  {:reply, reply, new_state, timeout | :hibernate}
  {:noreply, new_state}
  ...
{% endhighlight %}

As you can see, you do have the option not to reply with a value, and there are a few more options you
have that I won't go into, and that the [Elixir docs][handle_call_returns] cover in depth. We'll also 
talk about the state parameter later on. we pattern match in the function signature, and choose to handle
any requests for the `:get_seven` atom. Our seven-as-a-service GenServer responds with a tuple in the
form of `{:reply, reply, new_state}`.

We'll see later that GenServer can use the third element of this tuple to update the state we would have
received as the third parameter had we not prepended it with and underscore. We put a 7 in as our value
element, and presto! 7's are available for everyone in our cluster, with a simple 
`GenServer.call pid, :get_seven`.
Fun for the whole family!

## &GenServer.cast/2

What if our clients won't care about a value coming back? That's where `cast` comes in handy. Let's
expand our collection of nearly useless helper functions with a puts-as-a-service GenServer:

![Handle Cast]({{ site.url }}/images/posts/elixir/puts_as_a_service.png)

All modules that `use GenServer` should implement `start_link` in order to be added to the supervision
tree, but thats not the important part of this snippet right now. Our `handle_cast` function matches a
variable to bind to whatever value gets passed in as the first parameter, and immediately hands this
off to `IO.puts`. We hand a back a tuple in one of the [supported return value formats][handle_cast_returns]
and call it a day. That's all there is to it. Now, clients can `GenServer.cast pid, <value>` to send
data to us to IO.puts for them.

There also exists a GenServer.info/2 function to handle messages passed to us by other means, generally
via `send pid, msg`. If you have processes in your system that don't fit GenServer's use cases (unlikely,
but possible), `GenServer.info/2` allows you to seamlessly communicate with your GenServers nodes.

The OTP Framework also comes with a few other workers. Agent abstracts GenServer to a simple state wrapper.
GenEvent is useful for workers the need to drive events. Check them out in the Elixir Docs, where they're
described in depth.

# Supervisor

If this whole supervision tree thing is built up of processes watching processes, we should probably
talk about how they do that. Nodes that implement the Supervisor behavior serve only one purpose in
life: to start processes, and replace them when they crash. When you define a Supervisor, you specify
the processes it's responsible for watching (which can be any combination of workers and other Supervisors),
and a strategy for replacing them.

![Supervisor]({{ site.url }}/images/posts/elixir/supervisor.png)

This example demonstrates just how simple the Supervisor interface really is. There are only two functions
you're expected to fill in- one your supervisor should invoke to start you (`start_link/0`), and one in which
you declare and initialize your children (`init/1`, matched against the value you passed into the second
position of `Supervisor.start_link/2` or `/3`). In the `init/1` function you pass a list of your children
into `supervise/2` along with a supervision strategy.

# A strategic approach to web scale

There are four provided strategies the OTP framework gives you that you can specify for a supervisor should
use. These strategies, `:one_for_one`, `:one_for_all`, `:rest_for_one`, and `:simple_one_for_one`
give you different ways to have nodes in your supervision tree get restarted when they crash. Let's take
a look at each one individually.

## `:one_for_one`

Let's take the following supervisor as an example:

![OTP tree 1]({{ site.url }}/images/posts/elixir/otp_tree_1.png)

This example supervisor, `Processes.Supervisor` watches 5 different workers, named
WorkerA through WorkerE. When one of these workers dies, the supervisor will simply start up another instance
of that same worker. So if, for example, WorkerD were to crash, another instance of WorkerD would be started up,
and the Application continues on its business. Plain and simple. This is a good go-to strategy for stateless workers,
and workers that don't rely on any of the other workers' states.

## `:one_for_all`

The `:one_for_all` strategy is another simple option to work with. With this strategy selected, when one worker
under the Supervisor crashes, all of the other workers under the Supervisor are killed, and reinitialized.
Considering the same supervisor above (swapping out `:one_for_one` with `:one_for_all`), If WorkerD were to
crash, our Supervisor would immediately kill off all four of the remaining workers, and start up a new instance
of each. While this may seem like overkill, it is useful in places where workers are stateful, and could get into
weird lock-up states should their states become out of sync. Also note that messages that are in the inbox of
a worker when they are killed off are lost, and will not be added to the new worker's queue, so small losses of
service are possible in this strategy. There is a way to mitigate this problem, which we'll touch on after all
these strategies.

## `:rest_for_one`

You might have noticed in the above code example of a Supervisor that their children are specified as a list. This means
that the children of a Supervisor have an inherent ordering. The `:rest_for_one` strategy gives the option to only
kill off and restart the children that follow the child that originally crashed, in terms of order specified.
So, going back to our example Supervisor, if WorkerC crashed, the Supervisor would kill off WorkerD and WorkerE, and
then restart Workers C, D, and E. Similar concerns arise with this strategy as with the `:one_for_all` strategy.
If a worker relies on the state of another worker, but not vice-versa, the `rest_for_one` strategy offers some
advantages over the `:one_for_all` strategy.  

## `:simple_one_for_one`

For the `:simple_one_for_one` strategy, we need to look at a different example Supervisor:

![OTP tree 1]({{ site.url }}/images/posts/elixir/simple_supervisor.png)

Notice that in this example, the Supervisor is overseeing a homogeneous group of children- they are all instances of WorkerA.
With the `:simple_one_for_one` strategy, we give the supervisor a single type of child to observe, and as we give the
supervisor work, it will spawn the nessesary children. We won't get too detailed into this interface, as it can get fairly
hairy, but you can imagine how a pattern like this could be useful, for example, to a load balancing system.


# Fault Tolerance and Distributed Scale

`GenServer` provides a `terminate/2` callback, which provides a reason for shutting you (the worker)
down as the first parameter, and your current state as the second parameter. If you have multiple instances of
your `:one_for_all` Supervisor, you can use this callback as your opportunity to pass your state forward to
another instance of your worker elsewhere in the supervision tree, and attempt to mitigate losses of service.
That being said, passing an errored state from one instance to another is a potential opportunity to spread
a crash inducing error, so use this carefully and test it well. Another important thing to note is it is generally
considered good practice to spread instances of the same Supervisor across different machines. This way, should one
machine go down (be it for reasons of OTP strategy, loss of power, hardware failure, etc.), you should have
another node on some other hardware to handle traffic.

# Society of Software Engineers @ RIT Talk

You can check out a video recording of a talk I gave to the Society of Software Engineers
at school here below. I go over a bunch of topics starting all the way down at types and syntax,
and work up to OPT Applications. Hit the like button on YouTube if you enjoy the video!

<iframe width="854" height="480" src="https://www.youtube.com/embed/soTr3_99E5g" frameborder="0" allowfullscreen></iframe>

What do you think are some good use cases for the OTP architecture? What kinds of libraries would you want to
see arise to integrate with OTP? Have any constructive feedback about my talk? Notice a grammar / spelling /
accuracy error in my writing or speaking? Drop a comment below!

<!--Links-->
[handle_call_returns]: https://hexdocs.pm/elixir/GenServer.html#c:handle_call/3
[handle_cast_returns]: https://hexdocs.pm/elixir/GenServer.html#c:handle_cast/2

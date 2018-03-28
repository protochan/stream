// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// Copyright (c) 2018 Sid Mani
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

module.exports.extend = function (constructor) {
  constructor.prototype.iterate = function () {
    return this.attach((obj, next) => {
      obj.forEach(next);
    });
  };

  constructor.prototype.accumulate = function (acc) {
    return this.attach((obj, next) => {
      next({ obj, acc });
    });
  };

  constructor.prototype.first = function (n = 1) {
    let idx = 0;
    return this.attach((obj, next) => {
      if (idx < n) {
        next(obj);
      }
      idx += 1;
    });
  };

  constructor.prototype.queue = function (dispense) {
    let queue = [];
    let offset = 0;

    let backlog = 0;
    const child = this.attach((obj) => {
      queue.push(obj);
      if (backlog > 0) {
        dispense.next();
        backlog -= 1;
      }
    });

    dispense.on((count = 1) => {
      const num = Math.min(count, queue.length - offset);
      backlog += Math.max(0, count - (queue.length - offset));
      for (let i = 0; i < num; i += 1) {
        child.propagate(queue[offset + i]);
      }
      offset += num;
      if (offset >= queue.length) {
        offset = 0;
        queue = [];
      }
    });

    return child;
  };

  constructor.prototype.unique = function (fn = obj => obj) {
    const set = new Set();
    return this.attach((obj, next) => {
      const uid = fn(obj);
      if (!set.has(uid)) {
        set.add(fn(obj));
        next(obj);
      }
    });
  };
};

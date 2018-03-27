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
  constructor.prototype.invert = function (interval, time) {
    let last = 0;
    let id;
    const child = this.attach(() => {
      last = time();
    }, () => clearInterval(id));

    id = setInterval(() => {
      if (time() - last > interval) {
        child.propagate();
      }
    }, interval);

    return child;
  };

  constructor.prototype.debounce = function (interval, time) {
    let last = 0;
    return this.attach((obj, next) => {
      const now = time();
      if (now - last >= interval) {
        next(obj);
        last = now;
      }
    });
  };

  constructor.prototype.wait = function (time) {
    const ids = [];
    return this.attach((obj, next) => {
      ids.push(setTimeout(() => next(obj), time));
    }, () => ids.forEach(id => clearInterval(id)));
  };

  constructor.every = function (interval, count) {
    let id;
    let n = count;
    const str = new Stream(
      (o, next) => next(o),
      () => clearInterval(id),
    );
    const fn = () => {
      str.next();
      if (n !== undefined) {
        n -= 1;
      }
      if (n <= 0) {
        clearInterval(id);
        str.destroy();
      }
    };
    fn();
    id = setInterval(() => {
      fn();
    }, interval);
    return str;
  };
};

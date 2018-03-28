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

const Stream = class {
  constructor(
    fn = (obj, next) => next(obj),
    destructor = () => {},
  ) {
    this.fn = fn;
    this.destructor = destructor;
    this.children = [];
  }

  nextError(error) {
    this.children.forEach(child => child.nextError(error));
  }

  next(obj) {
    try {
      // execute fn on obj, and leave further calls up to fn
      this.fn(
        obj,
        o => this.propagate(o),
        e => this.nextError(e),
      );
    } catch (error) {
      this.nextError(error);
    }
  }

  // propagate the object without running any auxiliary functions
  propagate(obj) {
    this.children.forEach(child => child.next(obj));
  }

  destroy() {
    this.children.forEach(child => child.destroy());
    this.destructor();
    this.children = [];
  }

  attach(fn, destructor) {
    const child = new Stream(fn, destructor);
    this.children.push(child);
    return child;
  }
};

require('./operators/generic.js').extend(Stream);
require('./operators/list.js').extend(Stream);
require('./operators/time.js').extend(Stream);
require('./operators/multiple.js').extend(Stream);

module.exports = Stream;

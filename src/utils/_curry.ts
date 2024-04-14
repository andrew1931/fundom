type Curry2<A, B, R> = {
   (a: A): (b: B) => R;
   (a: A, b: B): R;
}

type Curry3<A, B, C, R> = {
   (a: A): Curry2<B, C, R>;
   (a: A, b: B): (c: C) => R;
   (a: A, b: B, c: C): R;
}

export function curry2<A, B, R>(fn: (a: A, b: B) => R): Curry2<A, B, R> {
   function curried(a: A): (b: B) => R; 
   function curried(a: A, b: B): R;
   function curried(a?: A, b?: B): any {
      switch (arguments.length) {
         case 0: 
            return curried;
         case 1:
            return function(b: B): R {
               return fn.call(this, a as A, b);
            }
         case 2:
            return fn(a as A, b as B);
      }
   }
   return curried;
}

export function curry3<A, B, C, R>(fn: (a: A, b: B, c: C) => R): Curry3<A, B, C, R> {
   function curried(a: A): Curry2<B, C, R>;
   function curried(a: A, b: B): (c: C) => R;
   function curried(a: A, b: B, c: C): R;
   function curried(a?: A, b?: B, c?: C): any {
      switch (arguments.length) {
         case 0: 
            return curried;
         case 1:
            return curry2(function(b: B, c: C): R {
               return fn.call(this, a as A, b, c);
            });
         case 2:
            return function(c: C): R {
               return fn.call(this, a as A, b as B, c);
            };
         case 3:
            return fn(a as A, b as B, c as C);
      }
   }
   return curried;
}

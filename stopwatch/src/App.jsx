import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Observable, Subject } from 'rxjs';
import {
  map,
  buffer,
  debounceTime,
  filter,
  takeUntil,
} from 'rxjs/operators';

import { Controls } from './components/Controls';

const App = () => {
  const [state, setState] = useState('stop');
  const [time, setTime] = useState(0);

  const stopClick = useCallback(new Subject(), []);
  const click = useCallback(new Subject(), []);

  const start = () => {
    setState('start');
  };

  const stop = useCallback(() => {
    setTime(0);
    setState('stop');
  }, []);

  const reset = useCallback(() => {
    setTime(0);
  }, []);

  const wait = useCallback(() => {
    click.next();
  }, []);

  useEffect(() => {
    const doubleClick = click.pipe(
      buffer(click.pipe(debounceTime(300))),
      map((arr) => arr.length),
      filter((length) => length >= 2),
    );
    doubleClick.subscribe(() => setState('wait'));
    const timer = new Observable((observer) => {
      let count = 0;
      const intervalId = setInterval(() => {
        observer.next(count += 1);
        console.log(count);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    });
    const subscription = timer
      .pipe(takeUntil(doubleClick))
      .pipe(takeUntil(stopClick))
      .subscribe({
        next: () => {
          if (state === 'start') {
            setTime((prev) => prev + 1);
          }
        },
      });

    return (() => {
      subscription.unsubscribe();
    });
  }, [state]);

  return (
    <section className="stopwatch">
      <Controls
        time={time}
        start={start}
        stop={stop}
        reset={reset}
        wait={wait}
      />
    </section>
  );
};

export default App;

import { Component, OnDestroy } from '@angular/core';
import { interval, Subject, Subscription, merge, NEVER, timer } from 'rxjs';
import { switchMap, mapTo, scan, withLatestFrom } from "rxjs/operators";

interface CounterState {
  isTicking: boolean;
  count: number;
  countUp: boolean;
  tickSpeed: number;
  countDiff: number;
}

enum ElementIds {
  TimerDisplay = 'timer-display',
  BtnStart = 'btn-start',
  BtnPause = 'btn-pause',
  BtnUp = 'btn-up',
  BtnDown = 'btn-down',
  BtnReset = 'btn-reset',
  BtnSetTo = 'btn-set-to',
  InputSetTo = 'input-set-to',
  InputTickSpeed = 'input-tick-speed',
  InputCountDiff = 'input-count-diff'
}


@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnDestroy {
  elementIds = ElementIds;

  initialCounterState: CounterState = {
    isTicking: false,
    count: 0,
    countUp: true,
    tickSpeed: 200,
    countDiff: 1
  };

  btnStart: Subject<Event> = new Subject<Event>();
  btnPause: Subject<Event> = new Subject<Event>();
  btnSetTo: Subject<Event> = new Subject<Event>();
  inputSetTo = new Subject<number>();

  setValue = this.btnSetTo.pipe(withLatestFrom(this.inputSetTo, (_, setTo) => setTo))

  subscription = new Subscription();
  count = 0;

  constructor() {
    this.subscription.add(
      merge(
        this.btnStart.pipe(mapTo(true)),
        this.btnPause.pipe(mapTo(false))
      )
      .pipe(
        switchMap(isTicking => {
          return isTicking ? timer(0, this.initialCounterState.tickSpeed) : NEVER
        })
      )
      .subscribe(
        _ => this.count = this.count + this.initialCounterState.countDiff
      )
    );

    this.subscription.add(
      this.setValue.subscribe(
        value => this.count = value
      )
    );

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getInputValue = (event: HTMLInputElement): number => {
    return parseInt(event['target'].value, 10);
  }

}

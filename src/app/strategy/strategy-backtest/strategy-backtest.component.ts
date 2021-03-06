import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { DialogService } from '../../core';

import * as core from '../../core';
import * as strategy from '../../strategy';
import * as proxy from '../../proxy';

@Component({
    moduleId: module.id,
    templateUrl: 'strategy-backtest.component.html',
    styleUrls: ['strategy-backtest.component.scss'],
})
export class StrategyBacktestComponent implements OnInit {
    private _strategy: proxy.StrategyQuery;
    private _editName: string | undefined;
    private _userId: string | number | null;
    private _selectedInstrument: proxy.Instrument;
    private _backtestCaption: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        public _dialogService: DialogService,
        private _authService: core.AuthService,
        private _service: proxy.StrategyApi
    ) {
    }

    public ngOnInit() {
        this._route.data.forEach((data: { strategy: proxy.StrategyQuery }) => {
            this._editName = data.strategy.name;
            this._strategy = data.strategy;
        });
        this._authService.userId$.subscribe(
            data => this._userId = data,
            error => console.error(error)
        );
    }

    public canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        // Allow synchronous navigation (`true`) if no strategy or the strategy is unchanged
        if (!this._strategy || this._strategy.name === this._editName) {
            return true;
        }
        // Otherwise ask the user with the dialog service and return its
        // promise which resolves to true or false when the user decides
        return this._dialogService.confirm('Discard changes?');
    }

    private cancel() {
        this.gotoStrategies();
    }

    private save() {
        this._strategy.name = this._editName;
        this.gotoStrategies();
    }

    private onBacktestClicked() {
        // Navigate with Absolute link
        this._service.backtest(this._selectedInstrument.title, this._strategy._id, { description: this._backtestCaption },
            { withCredentials: true }).subscribe(
            data => { console.log('here in data'); },
            error => { console.error(error); });
        return false;
    }

    private gotoStrategies() {
        const strategyId = this._strategy ? this._strategy._id : null;
        this._router.navigate(['/strategies', { _id: strategyId, foo: 'foo' }]);
    }
}

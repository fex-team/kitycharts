/* global ChartElement */

var Chart = kc.Chart = kity.createClass('Chart', {
    base: ChartElement,
    constructor: function () {
        this._data = null;
        this._elements = null;
    }
});
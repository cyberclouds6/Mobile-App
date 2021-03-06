import { createAction } from 'redux-actions';
import requester from '../../../initDependencies';

const currencyInfo = {
    SET_CURRENCY: 'SET_CURRENCY',
    SET_LOCRATE: 'SET_LOCRATE',
    SET_PREFER_CURRENCY: 'SET_PREFER_CURRENCY',
    SET_PREFER_LOCRATE: 'SET_PREFER_LOCRATE'
};

export const getCurrency = (currency, isRefresh = true, isPrefer = true) => {
    return dispatch => {
        if (isRefresh) {
            if (isPrefer) {
                dispatch(setCurrency({currency}));
            }
            else {
                dispatch(setPreferCurrency({currency}));
            }
        }
        requester.getLocRateByCurrency(currency).then(res => {
            res.body.then(data => {
                console.log("action getCurrency data", data);
                let locPrice = 0;
                if (currency == 'EUR') {
                    locPrice = data[0].price_eur;
                }
                else if (currency == 'USD') {
                    locPrice = data[0].price_usd;
                }
                else if (currency == 'GBP') {
                    locPrice = data[0].price_gbp;
                }
                if (isPrefer) {
                    dispatch(setLocRate({locRate:locPrice}));
                }
                else {
                    dispatch(setPreferLocRate({locRate:locPrice}));
                }
            }).catch(err => {
                console.log(err);
            });
        });
    }
};

export const setCurrency = createAction(currencyInfo.SET_CURRENCY);
export const setLocRate = createAction(currencyInfo.SET_LOCRATE);
export const setPreferCurrency = createAction(currencyInfo.SET_PREFER_CURRENCY);
export const setPreferLocRate = createAction(currencyInfo.SET_PREFER_LOCRATE);
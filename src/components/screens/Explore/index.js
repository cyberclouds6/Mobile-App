import {
    AsyncStorage,
    Image,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';

import DateAndGuestPicker from '../../organisms/DateAndGuestPicker';
import RNPickerSelect from 'react-native-picker-select';//eslint-disable-line
import SearchBar from '../../molecules/SearchBar';
import Toast from 'react-native-easy-toast';//eslint-disable-line
import { domainPrefix } from '../../../config';
import requester from '../../../initDependencies';
import styles from './styles';
import { userInstance } from '../../../utils/userInstance';

import * as currencyActions from '../../../redux/action/Currency';

const shouldBeNative = true; // This line controls which screen should be shown when clicked on search, it its true it will take to hardcoded hotel else will take to webview
const openPropertySock = true;
const BASIC_CURRENCY_LIST = ['EUR', 'USD', 'GBP'];//eslint-disable-line

class Explore extends Component {
    static self;

    constructor(props) {
        super(props);

        const startDate = moment()
            .add(1, 'day');
        const endDate = moment()
            .add(2, 'day');

        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateFilter = this.updateFilter.bind(this);
        this.gotoGuests = this.gotoGuests.bind(this);
        this.gotoSettings = this.gotoSettings.bind(this);
        this.gotoSearch = this.gotoSearch.bind(this);
        this.renderAutocomplete = this.renderAutocomplete.bind(this);
        this.handleAutocompleteSelect = this.handleAutocompleteSelect.bind(this);
        this.handlePopularCities = this.handlePopularCities.bind(this);
        this.onDatesSelect = this.onDatesSelect.bind(this);
        this.onSearchHandler = this.onSearchHandler.bind(this);
        this.showToast = this.showToast.bind(this);
        this.state = {
            searchHotel: true,
            isHotelSelected: true,
            countryId: 0,
            countryName: '',
            value: '',
            countries: [],
            cities: [],
            search: '',
            regionId: '',
            checkInDate: startDate.format('ddd, DD MMM').toString(),
            checkInDateFormated: startDate.format('DD/MM/YYYY').toString(),
            daysDifference: 1,
            checkOutDate: endDate.format('ddd, DD MMM').toString(),
            checkOutDateFormated: endDate.format('DD/MM/YYYY').toString(),
            guests: 2,
            adults: 2,
            children: 0,
            infants: 0,
            roomsDummyData: [{
                adults: 2,
                children: []
            }],
            filter: {
                showUnavailable: true, name: '', minPrice: 1, maxPrice: 5000, stars: [0, 1, 2, 3, 4, 5]
            },
            count: {
                beds: 2,
                bedrooms: 0,
                bathrooms: 0
            },
            childrenBool: false,
            locRate: props.locRate,//eslint-disable-line
            currency: props.currency,//eslint-disable-line
            currencySign: props.currencySign,//eslint-disable-line
            email: '',
            token: ''
        };

        console.log('explorer  currency', props.currency, props.locRate);
        this.props.actions.getCurrency(props.currency, false);//eslint-disable-line
        Explore.self = this;
    }

    async componentWillMount() {
        const token_value = await AsyncStorage.getItem(`${domainPrefix}.auth.locktrip`);
        const email_value = await AsyncStorage.getItem(`${domainPrefix}.auth.username`);
        this.setState({
            token: token_value,
            email: email_value,
        });

        console.log('componentWillMount', token_value, email_value);
        // Below line gives null cannot be casted to string error on ios please look into it
        requester.getUserInfo().then((res) => {
            res.body.then((data) => {
                console.log('componentWillMount', data);
                userInstance.setUserData(data);
            }).catch((err) => {
                console.log('componentWillMount', err);
            });
        });
        this.setCountriesInfo();
    }

    async componentDidMount() {
        console.disableYellowBox = true;
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.currency != prevProps.currency || this.props.locRate != prevProps.locRate) {
            this.setState({ currency: this.props.currency, currencySign: this.props.currencySign, locRate: this.props.locRate });
        }

        if (this.props.countries != prevProps.countries) {
            this.setCountriesInfo();
        }
    }

    onChangeHandler(property) {
        return (value) => {
            this.setState({ [property]: value });
        };
    }

    onDatesSelect({ startDate, endDate }) {
        const year = (new Date()).getFullYear();
        const start = moment(startDate, 'ddd, DD MMM');
        const end = moment(endDate, 'ddd, DD MMM');
        this.setState({
            daysDifference: moment.duration(end.diff(start)).asDays(),
            checkInDate: startDate,
            checkOutDate: endDate,
            checkInDateFormated: (moment(startDate, 'ddd, DD MMM')
                .format('DD/MM/')
                .toString()) + year,
            checkOutDateFormated: (moment(endDate, 'ddd, DD MMM')
                .format('DD/MM/')
                .toString()) + year
        });
    }

    setCountriesInfo() {
        countryArr = [];
        this.props.countries.map((item, i) => {
            countryArr.push({
                label: item.name,
                value: item
            });
        });
        this.setState({
            countries: countryArr,
            countriesLoaded: true,
            countryId: countryArr[0].value.id,
            countryName: countryArr[0].label
        });
    }

    showToast() {
        this.refs.toast.show('This feature is not enabled yet in the current alpha version.', 1500);
    }

    onSearchHandler(value) {
        this.setState({ search: value });
        if (value === '') {
            this.setState({ cities: [] });
        } else {
            requester.getRegionsBySearchParameter([`query=${value}`]).then(res => {
                res.body.then(data => {
                    if (this.state.search != '') {
                        this.setState({ cities: data });
                    }
                });
            });
        }
    }

    // getCountryValues() {
    //     requester.getCountries(true).then(res => {
    //         res.body.then(data => {
    //             countryArr = [];
    //             data.map((item, i) => {
    //                 countryArr.push({
    //                     'label': item.name,
    //                     'value': item
    //                 });
    //             });
    //             console.log(countryArr[0].value.id);
    //             this.setState({
    //                 countries: countryArr,
    //                 countriesLoaded: true,
    //                 countryId: countryArr[0].value.id,
    //                 countryName: countryArr[0].label
    //             });
    //         });
    //     });
    // }

    onValueChange = (value) => {
        console.log(value);
        console.log(this.state.loc);
    };

    updateData(data) {
        this.setState({
            adults: data.adults,
            children: data.children,
            infants: data.infants,
            guests: data.adults + data.children + data.infants,
            childrenBool: data.childrenBool
        });
    }

    updateFilter(data) {
        this.setState({
            isHotelSelected: data.isHotelSelected,
            count: data.count
        });
    }

    gotoGuests() {
        this.props.navigation.navigate('GuestsScreen', {
            guests: this.state.guests,
            adults: this.state.adults,
            children: this.state.children,
            infants: this.state.infants,
            updateData: this.updateData,
            childrenBool: this.state.childrenBool
        });
    }

    gotoSettings() {
        this.props.navigation.navigate('FilterScreen', {
            isHotelSelected: this.state.isHotelSelected,
            count: this.state.count,
            updateFilter: this.updateFilter,
            searchedCity: this.state.search,
            searchedCityId: 72,
            checkInDate: this.state.checkInDate,
            checkOutDate: this.state.checkOutDate,
            guests: this.state.guests,
            adults: this.state.adults,
            children: this.state.children,
            regionId: this.state.regionId,
            currency: this.state.currency,
            checkOutDateFormated: this.state.checkOutDateFormated,
            checkInDateFormated: this.state.checkInDateFormated,
            roomsDummyData: encodeURI(JSON.stringify(this.state.roomsDummyData))
        });
    }

    gotoSearch() {
        //Open new property screen that uses sock-js
        if (shouldBeNative && openPropertySock){
            this.props.navigation.navigate('PropertySock', {
                searchedCity: this.state.search,
                searchedCityId: 72,
                checkInDate: this.state.checkInDate,
                checkOutDate: this.state.checkOutDate,
                guests: this.state.guests,
                children: this.state.children,
                countryId: this.state.countryId,
                regionId: this.state.regionId,
                isHotelSelected: this.state.isHotelSelected,
                checkOutDateFormated: this.state.checkOutDateFormated,
                checkInDateFormated: this.state.checkInDateFormated,
                roomsDummyData: encodeURI(JSON.stringify(this.state.roomsDummyData)),
                currency: this.state.currency,
                currencySign: this.state.currencySign,
                locRate: this.state.locRate,
                email: this.state.email,
                token: this.state.token,
                daysDifference: this.state.daysDifference,
                filter: encodeURI(JSON.stringify(this.state.filter)),
            });
        }
        else if (shouldBeNative) {
            if (!this.state.searchHotel) {
                // user searched for home
                this.props.navigation.navigate('PropertyList', {
                    currency: this.state.currency,
                    locRate: this.state.locRate,
                    countryId: this.state.countryId,
                    countryName: this.state.countryName,
                    startDate: this.state.checkInDateFormated,
                    endDate: this.state.checkOutDateFormated,
                    guests: 2
                });
            } else {
                this.props.navigation.navigate('Debug', {
                    regionId: this.state.regionId,
                    currency: this.state.currency,
                    locRate: this.state.locRate,
                    startDate: this.state.checkInDateFormated,
                    endDate: this.state.checkOutDateFormated,
                    startDate: this.state.checkInDateFormated,
                    endDate: this.state.checkOutDateFormated
                });
            }
        } else if (!this.state.searchHotel) {
            this.props.navigation.navigate('PropertyList', {
                currency: this.state.currency,
                locRate: this.state.locRate,
                countryId: this.state.countryId,
                countryName: this.state.countryName,
                startDate: this.state.checkInDateFormated,
                endDate: this.state.checkOutDateFormated,
                guests: 2
            });
            }
            else {
                if (this.state.regionId == '') {
                    //Empty location
                    this.refs.toast.show('Location field cannot be empty.', 1500);
                    this.setState({ search: '' });
                }
                else {
                    this.props.navigation.navigate('PropertyScreen', {
                        searchedCity: this.state.search,
                        searchedCityId: 72,
                        checkInDate: this.state.checkInDate,
                        checkOutDate: this.state.checkOutDate,
                        guests: this.state.guests,
                        children: this.state.children,
                        countryId: this.state.countryId,
                        regionId: this.state.regionId,
                        isHotelSelected: this.state.isHotelSelected,
                        currency: this.state.currency,
                        checkOutDateFormated: this.state.checkOutDateFormated,
                        checkInDateFormated: this.state.checkInDateFormated,
                        roomsDummyData: encodeURI(JSON.stringify(this.state.roomsDummyData)),
                        locRate: this.state.locRate,
                        email: this.state.email,
                        token: this.state.token
                    });
                }
            }
    }

    handleAutocompleteSelect(id, name) {
        this.setState({
            cities: [],
            search: name,
            regionId: id
        });
    }

    handlePopularCities(id, name) {
        this.setState({
            cities: [],
            search: name,
            regionId: id,
            searchHotel: true
        });
    }

    renderAutocomplete() {
        if (this.state.cities.length > 0) {
            return (
                <ScrollView
                    style={{
                        position: 'relative',
                        marginLeft: 17,
                        marginRight: 17,
                        minHeight: 100,
                        zIndex: 99,
                    }}
                >
                    {
                        this.state.cities.map(result => { //eslint-disable-line
                            return (//eslint-disable-line
                                <TouchableOpacity
                                    key={result.id}
                                    style={styles.autocompleteTextWrapper}
                                    onPress={() => this.handleAutocompleteSelect(result.id, result.query)}
                                >
                                    <Text style={styles.autocompleteText}>{result.query}</Text>
                                </TouchableOpacity>
                            );//eslint-disable-line
                        })
                    }
                </ScrollView>
            );
        } else {//eslint-disable-line
            return null;//eslint-disable-line
        }
    }

    renderHotelTopView() {
        return (
            <View style={styles.SearchAndPickerwarp}>
                <View style={styles.searchAreaView}>
                    <SearchBar
                        autoCorrect={false}
                        value={this.state.search}
                        onChangeText={this.onSearchHandler}
                        placeholder="Discover your next experience"
                        placeholderTextColor="#bdbdbd"
                        leftIcon="search"
                        onLeftPress={this.gotoSearch}
                    />
                </View>
            </View>
        );
    }

    renderHomeTopView() {
        return (
            //Home
            <View style={styles.SearchAndPickerwarp}>
                <View style={styles.countriesSpinner}>
                    <View style={styles.pickerWrapHomes}>
                        <RNPickerSelect
                            items={this.state.countries}
                            placeholder={{
                                label: 'Choose a location',
                                value: 0
                            }}
                            onValueChange={(value) => {
                                this.setState({
                                    countryId: value.id,
                                    countryName: value.name,
                                    value: value
                                });
                            }}
                            value={this.state.value}
                            style={{ ...pickerSelectStyles }}
                        >
                        </RNPickerSelect>
                    </View>
                </View>
                {/* <View style={styles.pickerWrap}>
                    <RNPickerSelect
                        items={this.state.items}
                        onValueChange={(value) => {
                            console.log(value);
                            this.spinnerValueChange(value);
                        }}
                        value={this.state.language}
                        style={{ ...pickerSelectStyles }}
                    >
                    </RNPickerSelect>
                </View> */}
            </View>
        );
    }

    renderHotelSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/hotels_selected.png')}
                />
            </View>
        )
    }

    renderHotelDeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/hotels_not_selected.png')}
                />
            </View>
        )
    }

    renderHomeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/homes_selected.png')}
                />
            </View>
        )
    }

    renderHomeDeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/homes__not_selected.png')}
                />
            </View>
        )
    }

    render() {
        const {
            checkInDate, checkOutDate, guests
        } = this.state;
        return (
            <View style={styles.container}>
                <Toast
                    ref="toast"
                    style={{ backgroundColor: '#DA7B61' }}
                    position='bottom'
                    positionValue={150}
                    fadeInDuration={500}
                    fadeOutDuration={500}
                    opacity={1.0}
                    textStyle={{ color: 'white', fontFamily: 'FuturaStd-Light' }}
                />
                {this.state.searchHotel ? this.renderHotelTopView() : this.renderHomeTopView()}
                {this.renderAutocomplete()}

                <View style={{ marginBottom: 100, marginLeft: 17, marginRight: 17 }}>
                    <ScrollView
                        automaticallyAdjustContentInsets={true}
                    >

                        <View style={styles.scrollViewContentMain}>
                            <DateAndGuestPicker
                                checkInDate={checkInDate}
                                checkOutDate={checkOutDate}
                                adults={guests}
                                children={0}
                                guests={0}
                                infants={0}
                                gotoGuests={this.gotoGuests}
                                gotoSearch={this.gotoSearch}
                                onDatesSelect={this.onDatesSelect}
                                gotoSettings={this.gotoSettings}
                                showSearchButton={true}
                            />
                        </View>

                        <Text style={[styles.scrollViewTitles, { marginBottom: 5, marginTop: 5 }]}>Discover</Text>

                        <View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

                                <TouchableOpacity onPress={() => this.setState({ searchHotel: true })}
                                    style={styles.homehotelsView}>
                                    <Image
                                        style={styles.imageViewHotelsHomes} resizeMode='stretch'
                                        source={require('../../../assets/home_images/hotels.png')} />
                                    {this.state.searchHotel ? this.renderHotelSelected() : this.renderHotelDeSelected()}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({
                                    searchHotel: false,
                                    cities: [],
                                    search: '',
                                    regionId: 0
                                })}
                                style={styles.homehotelsView}>
                                    <Image style={styles.imageViewHotelsHomes} resizeMode='stretch'
                                        source={require('../../../assets/home_images/homes.png')} />
                                    {!this.state.searchHotel ? this.renderHomeSelected() : this.renderHomeDeSelected()}
                                </TouchableOpacity>

                            </View>

                            <Text style={[styles.scrollViewTitles,  { marginBottom: 5, marginTop: 5 }]}>Popular Destinations</Text>

                            <View style={styles.divsider} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                <TouchableOpacity onPress={() => this.handlePopularCities(52612, 'London , United Kingdom')}
                                    style={styles.subViewPopularHotelsLeft}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/london.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.handlePopularCities(18417, 'Madrid , Spain')}
                                    style={styles.subViewPopularHotelsLeft}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/Madrid.png')} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

                                <TouchableOpacity onPress={() => this.handlePopularCities(16471, 'Paris , France')}
                                    style={styles.subViewPopularHotelsLeft}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/paris.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.handlePopularCities(15375, 'Sydney , Australia')}
                                    style={styles.subViewPopularHotelsRight}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/Sydney.png')} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={this.showToast}>
                                <View style={styles.searchButtonView}>
                                    <Text style={styles.searchButtonText}>Show All</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.bottomView}>
                                <Image style={styles.bottomViewText} resizeMode='center'
                                    source={require('../../../assets/texthome.png')} />
                                <TouchableOpacity onPress={this.showToast} style={styles.getStartedButtonView}>
                                    <View>
                                        <Text style={styles.searchButtonText}>Get Started</Text>
                                    </View>
                                </TouchableOpacity>
                                <Image style={styles.bottomViewBanner} resizeMode='stretch'
                                    source={require('../../../../src/assets/vector.png')} />
                            </View>

                        </View>

                    </ScrollView>
                </View>
            </View>
        );
    }
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        fontSize: 16,
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        backgroundColor: 'white',
        color: 'black'
    }
});

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        locRate: state.currency.locRate,
        countries: state.country.countries
    };
}

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(currencyActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Explore);

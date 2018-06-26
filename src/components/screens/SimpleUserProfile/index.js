import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AsyncStorage, Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Image from 'react-native-remote-svg';
import moment from 'moment'
import FontAwesome, { Icons } from 'react-native-fontawesome';
import { connect } from 'react-redux';
import BackButton from '../../atoms/BackButton';
import ProgressDialog from '../../atoms/SimpleDialogs/ProgressDialog';
import ProfileHistoryItem from '../../atoms/ProfileHistoryItem';
import UserProfileReviews from '../../organisms/UserProfileReviews'
import UserProfileHomes from '../../organisms/UserProfileHomes'
import { getUserInfo } from '../../../utils/requester';
import { imgHost } from '../../../config.js'
import styles from './styles';

class SimpleUserProfile extends Component {
    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func
        })
    }

    static defaultProps = {
        navigation: {
            navigate: () => {}
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            birthday:'',
            birthdayDisplay:'',
            city:{},
            country:{},
            email:'',
            firstName:'',
            lastName:'',
            gender:'',
            image:'',
            locAddress:'',
            phoneNumber:'',
            preferredCurrency:{},
            preferredLanguage:'',
            day:'',
            month:'',
            year:'',
            showProgress:true,
        }
    }

    componentDidMount() {
        getUserInfo()
        .then(res => res.response.json())
        .then(parsedResp => {
            let day = '00';
            let month = '00';
            let year = '0000';

            if (parsedResp.birthday !== null) {
                let birthday = moment.utc(parsedResp.birthday);
                day = birthday.format('DD');
                month = birthday.format('MM');
                year = birthday.format('YYYY');
            }
            this.setState({
                showProgress: false,
                birthday : parsedResp.birthday == null? '': parsedResp.birthday,
                birthdayDisplay : month + '/' + day + '/' + year,
                city : parsedResp.city == null? '': parsedResp.city,
                country : parsedResp.country == null? parsedResp.countries[0]: parsedResp.country,
                email : parsedResp.email == null? '': parsedResp.email,
                firstName : parsedResp.firstName == null? '': parsedResp.firstName,
                lastName : parsedResp.lastName == null? '': parsedResp.lastName,
                gender : parsedResp.gender == null? '': parsedResp.gender,
                image : parsedResp.image == null? '': parsedResp.image,
                locAddress : parsedResp.locAddress == null? '': parsedResp.locAddress,
                phoneNumber : parsedResp.phoneNumber == null? '': parsedResp.phoneNumber,
                preferredCurrency: parsedResp.preferredCurrency == null? parsedResp.currencies[0] : parsedResp.preferredCurrency,
                preferredLanguage: parsedResp.preferredLanguage == null? 'English': parsedResp.preferredLanguage,
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        const { navigate, goBack } = this.props.navigation;
        let gender = '';
        if (this.state.gender === 'man') {
            gender = 'M';
        }
        else if (this.state.gender === 'women') {
            gender = 'F';
        }

        let image = '';
        if (this.state.image != '') {
            if (this.state.image == 'https://staging.locktrip.com/images/default.png' || this.state.image == 'images/default.png') {
                image = {uri:'https://staging.locktrip.com/images/default.png'};
            }
            else {
                image ={uri:imgHost+this.state.image}
            }
        }

        return (
            <View style={styles.container}>
                <View style={styles.navContainer}>
                    <View style={styles.titleConatiner}>
                        <BackButton style={styles.closeButton} onPress={() => goBack()}/>
                        <Text style={styles.title}>Profile</Text>
                    </View>
                </View>
                <ScrollView showsHorizontalScrollIndicator={false} style={{width: '100%'}}>
                    <View style={styles.body}>
                        <View style={styles.topContainer}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarView}>
                                {
                                    this.state.image == '' ?
                                        <Image style={styles.avatar} source={require('../../../assets/temple/user_profile_avatar.png')} />
                                        :
                                        <Image style={styles.avatar} source={image} />
                                }
                                </View>
                                <Text style={styles.gender}>{gender}</Text>
                            </View>
                            <Text style={styles.name}>{this.state.firstName} {this.state.lastName}</Text>
                            {
                                this.state.city == ''?
                                    <Text style={styles.location}>{this.state.country.name}</Text>
                                    :
                                    <Text style={styles.location}>{this.state.city.name} {this.state.country.name}</Text>
                            }
                        </View>

                        <View style={[styles.lineStyle, {marginLeft:0, marginRight:0}]} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"Birthdate"}
                            detail = {this.state.birthdayDisplay}/>

                        <View style={styles.lineStyle} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"Email"}
                            detail = {this.state.email}/>

                        <View style={styles.lineStyle} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"Phone number"}
                            detail = {this.state.phoneNumber}/>

                        <View style={styles.lineStyle} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"ETH/LOC address"}
                            detail = {this.state.locAddress}/>


                        <View style={styles.lineStyle} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"Preferred language"}
                            detail = {this.state.preferredLanguage}/>

                        <View style={styles.lineStyle} />
                        <ProfileHistoryItem
                            style={styles.historyStyle}
                            title = {"Preferred currency"}
                            detail = {this.state.preferredCurrency.code}/>
                    </View>
                </ScrollView>
                <ProgressDialog
                        visible={this.state.showProgress}
                        title=""
                        message={this.state.loadMessage}
                        animationType="fade"
                        activityIndicatorSize="large"
                        activityIndicatorColor="black"/>
            </View>
        );
    }
}

export default SimpleUserProfile;

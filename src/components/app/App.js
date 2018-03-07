import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import SplashScreen from 'react-native-smart-splash-screen'

import { RootNavigator, LoginNavigator } from '../../routes';

import TopSpacer from '../common/TopSpacer';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginComplete: false
    };

    this.onLoginComplete = this.onLoginComplete.bind(this);
  }

  componentDidMount () {
    SplashScreen.close({
      animationType: SplashScreen.animationType.scale,
      duration: 850,
      delay: 500,
    })
  }

  onLoginComplete() {
    this.setState({ isLoginComplete: true });
  }

  renderNavigation() {
    if (this.state.isLoginComplete) return <RootNavigator />;
    else return <LoginNavigator screenProps={{ onLoginComplete: this.isLoginComplete }} />
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="rgba(0,0,0,0)"
          translucent={true}
          barStyle="light-content"
        />
        {/*<TopSpacer />*/}

        {this.renderNavigation()}
      </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#DA7B61',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

import React, { Component, PropTypes } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { connect } from 'react-redux'
import { Actions } from 'react-native-router-flux'
import MapView from 'react-native-maps'
import axios from 'axios'
import Polyline from '@mapbox/polyline';

import {
  LocationButtonGroup,
  LocationSearchHeader,
  LocationSearchResults,
  SearchResultsList,
  NavigationIcon,
} from '../components'

const mapStateToProps = (state) => ({
  recentLocations: state.recentLocations,
  shortcutLocations: state.recentLocations.slice(0, 3),
})

class Main extends Component {
  state = {
    searchResultsOpen: false,
    sourceText: 'Work',
    destinationText: '',
    directions:[]
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      ({coords}) => {
        const {latitude, longitude} = coords
        this.setState({
          position: {
            latitude,
            longitude,
          },
          region: {
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
        })

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=37.710452,-122.476486`;

        /*axios.get(url).then(({data})=>{
          console.log(data);
          let directions = [];
          const { routes } = data;
          const { legs } = routes[0];
          const { steps } = legs[0];
          steps.map((v,k)=>{
            const start_location = {
              latitude:v.start_location.lat,
              longitude:v.start_location.lng
            }
            const end_location = {
              latitude:v.end_location.lat,
              longitude:v.end_location.lng
            }
            directions = [
              ...directions,
              start_location,
              end_location
            ]
          })
        })*/

        axios.get(url).then(({data})=>{
          const testMap = data.routes[0].legs[0].steps
          const mapRoute = testMap.map((v,k)=>{
            const start_location = {
              latitude:v.start_location.lat,
              longitude:v.start_location.lng
            }
            const end_location = {
              latitude:v.end_location.lat,
              longitude:v.end_location.lng
            }

            return {
              ...start_location,
              ...end_location
            }
          })

          /*this.setState({
            directions:mapRoute
          })*/

          let points = Polyline.decode(data.routes[0].overview_polyline.points);
          let directions = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
          })

          this.setState({directions})
        })

      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    )
  }

  render() {
    const {recentLocations, shortcutLocations} = this.props
    const {searchResultsOpen, sourceText, destinationText, region, position} = this.state

    return (
      <View style={styles.container}>
        <LocationSearchHeader
          placeholder="Where to?"
          onSubmitEditing={() =>{ console.log("Submit location search done")}}/>
        <MapView
          style={styles.map}
          region={region}>
          {position && (
            <MapView.Circle
              center={position}
              radius={500}
              strokeColor={'transparent'}
              fillColor={'rgba(112,185,213,0.30)'}
            />
          )}
          {position && (
            <MapView.Circle
              center={position}
              radius={200}
              strokeColor={'transparent'}
              fillColor={'#3594BC'}
            />
          )}

          <MapView.Polyline
            strokeWidth={2}
            strokeColor={'green'}
            coordinates={this.state.directions}
          />
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  map: {
    flex: 1,
    zIndex: -1,
  }
})

export default connect(mapStateToProps)(Main)

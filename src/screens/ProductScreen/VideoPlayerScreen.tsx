import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import Orientation, {
  useOrientationChange,
} from 'react-native-orientation-locker';
import {
  RouteProp,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import VideoPlayer from 'react-native-video-controls';

type Props = {
  navigation: NavigationProp<any>;
  route: RouteProp<{params: {uri: string}}, 'params'>;
};

const VideoPlayerScreen: React.FC<Props> = ({navigation, route}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState('PORTRAIT');
  const [showFullScreenButton, setShowFullScreenButton] = useState(true);
  const isFocused = useIsFocused();

  const videoUrl = route.params.uri;

  const toggleOrientation = () => {
    if (currentOrientation === 'PORTRAIT') {
      Orientation.lockToLandscapeLeft();
      setCurrentOrientation('LANDSCAPE');
    } else {
      Orientation.lockToPortrait();
      setCurrentOrientation('PORTRAIT');
    }
  };

  const handleBackPress = () => {
    setIsPlaying(false);
    setShowFullScreenButton(false);
    navigation.goBack();
    Orientation.lockToPortrait();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {isFocused && (
          <VideoPlayer
            source={{uri: videoUrl}}
            style={styles.backgroundVideo}
            // controls={true}
            //   paused={!isPlaying}
            toggleResizeModeOnFullscreen={false}
            resizeMode="contain"
            controlAnimationTiming={0}
            // tapAnywhereToPause={true}
            disableFullscreen
            onHideControls={() => setShowFullScreenButton(false)}
            onShowControls={() => setShowFullScreenButton(true)}
            onBack={handleBackPress}
          />
        )}
        {showFullScreenButton && (
          <TouchableOpacity
            onPress={toggleOrientation}
            style={{
              width: 15,
              height: 15,
              padding: 20,
              position: 'absolute',
              top: 2,
              right: 20,
            }}>
            <Image
              source={require('../../UI/images/full-screen.png')}
              style={{width: 30, height: 30}}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  playButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default VideoPlayerScreen;

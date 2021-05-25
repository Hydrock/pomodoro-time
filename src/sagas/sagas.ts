import { call, put, takeEvery, takeLatest, delay } from "redux-saga/effects";
import * as constants from 'Src/constants';
import * as Cookies from 'js-cookie';

import testAudio1 from 'Src/static/sounds/alert_1.mp3';
import testAudio2 from 'Src/static/sounds/alert_2.mp3';
import testAudio3 from 'Src/static/sounds/alert_3.mp3';
import testAudio4 from 'Src/static/sounds/alert_4.mp3';
import testAudio5 from 'Src/static/sounds/alert_5.mp3';

const createAudioContext = require('ios-safe-audio-context');

/*** audio ***/
function getPlayAudioFunc () {
  const context = createAudioContext();

  return function* (action: any) {
    try {
      yield put({ type: constants.PLAY_AUDIO_START });
      // @ts-ignore
      const audioData = yield action.payload.audioFetch.arrayBuffer();
      // @ts-ignore
      const AudioBuffer = yield context.decodeAudioData(audioData);
      let source = context.createBufferSource();
      source.buffer = AudioBuffer;
      let destinationGlobal = context.destination;
      source.connect(destinationGlobal);
      source.start(0);
      yield put({ type: constants.PLAY_AUDIO_SUCCEEDED });
    } catch (e) {
      yield put({ type: constants.PLAY_AUDIO_FAILED, payload: { message: e.message } });
    }
  }
}

const playAudio = getPlayAudioFunc();

function* fetchAudioFile (action: any) {
  // get ringtone name from cookies
  let ringtoneName = Cookies.get('ringtone');
  // if ringtone name exists, set default ringtone in cookies
  if (!ringtoneName) {
    ringtoneName = constants.RINGTONE_1;
    Cookies.set('ringtone', constants.RINGTONE_1);
  }

  const choiseSound = (name: any) => {
    try {
      switch (name) {
        case constants.RINGTONE_1:
          return testAudio1;
        case constants.RINGTONE_2:
          return testAudio2;
        case constants.RINGTONE_3:
          return testAudio3;
        case constants.RINGTONE_4:
          return testAudio4;
        case constants.RINGTONE_5:
          return testAudio5;
        default:
          return testAudio1;
      }
    } catch (e) {
      return '';
    }
  };

  // get ringtone url address
  const ringtoneUrl = choiseSound(ringtoneName);

  const fetchOptions = {
    method: 'GET',
    responseType: 'arraybuffer'
  }

  // fetch audio
  try {
    // @ts-ignore
    const audioFetch: any = yield fetch(ringtoneUrl, fetchOptions);
    yield put({ type: constants.AUDIO_FETCH_SUCCEEDED,  payload: {audioFetch} });
  } catch (e) {
    console.log(e)
    yield put({ type: constants.AUDIO_FETCH_FAILED, message: e.message });
  }
}
/*** /audio ***/

/* saga watcher */
function* sagaWatcher() {
  // audio
  yield takeLatest(constants.PLAY_AUDIO, fetchAudioFile);
  yield takeLatest(constants.AUDIO_FETCH_SUCCEEDED, playAudio);
}

export default sagaWatcher;

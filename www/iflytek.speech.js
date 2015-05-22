var cordova = require('cordova');
var channel = require('cordova/channel');
var exec = require('cordova/exec');

var iflytekSpeech = function () {
    this.channels = {
        'EvaluatorResults': channel.create('EvaluatorResults'),
        'SpeechResults': channel.create('SpeechResults'),
        'SpeechError': channel.create('SpeechError'),
        'VolumeChanged': channel.create('VolumeChanged'),
        'SpeechBegin': channel.create('SpeechBegin'),
        'SpeechEnd': channel.create('SpeechEnd'),
        'SpeechCancel': channel.create('SpeechCancel'),
        'SpeakCompleted': channel.create('SpeakCompleted'),
        'SpeakBegin': channel.create('SpeakBegin'),
        'SpeakProgress': channel.create('SpeakProgress'),
        'SpeakPaused': channel.create('SpeakPaused'),
        'SpeakResumed': channel.create('SpeakResumed'),
        'SpeakCancel': channel.create('SpeakCancel'),
        'BufferProgress': channel.create('BufferProgress')
    };
    this.languages = ['zh_cn', 'en_us'];
    this.voices = {
        'zh_cn': {
            'xiaoyan': 'female',
            'xiaoyu': 'male',
            'vixy': 'male',
            'xiaoqi': 'female',
            'vixf': 'male',
        },
        'en_us': {
            'catherine': 'female',
            'henry': 'male',
            'vimary': 'female',
        }
    };
    this.text = '';
};

iflytekSpeech.prototype = {
    _eventHandler: function (info) {
        if (info.event in this.channels) {
            this.channels[info.event].fire(info);
        }
    },

    addEventListener: function (event, f, c) {
        if (event in this.channels) {
            this.channels[event].subscribe(f, c || this);
        }
    },

    removeEventListener: function (event, f) {
        if (event in this.channels) {
            this.channels[event].unsubscribe(f);
        }
    },

    initialize: function (appId) {
        // closure variable for local function to use
        var speech = this;

        // the callback will be saved in the session for later use
        var callback = function (info) {
            speech._eventHandler(info);
        };
        exec(callback, function(err) { alert(err); }, 'Speech', 'initialize', [appId]);

        function parseSpeechResults(e) {
            var data = JSON.parse(e.results);
            if (data.sn === 1)
                speech.text = '';

            var ws = data.ws;
            for (var i = 0; i < ws.length; i++) {
                var word = ws[i].cw[0].w;
                speech.text += word;
            }

            if (data.ls === true) {
                if (typeof speech.onSpeakCallback === 'function') {
                    speech.onSpeakCallback(speech.text);
                }
            }
        }

        function parseEvaluatorResults(xml) {
            if (typeof DOMParser !== "undefined" && typeof speech.onEvaluateCallback === 'function') {
                var parser = new DOMParser();
                var dom = parser.parseFromString(xml, "text/xml");

                var total_score = 0.0;

                if (dom.getElementsByTagName('read_syllable').length > 0) {
                    total_score = parseFloat(dom.getElementsByTagName('read_syllable')[0].getAttribute('total_score'));
                } else if (dom.getElementsByTagName('read_word').length > 0) {
                    total_score = parseFloat(dom.getElementsByTagName('read_word')[0].getAttribute('total_score'));
                } else if (dom.getElementsByTagName('read_sentence').length > 0) {
                    total_score = parseFloat(dom.getElementsByTagName('read_sentence')[0].getAttribute('total_score'));
                }
                total_score = total_score * 20.0;
                speech.onEvaluateCallback(total_score);
            }
        };

        this.addEventListener('SpeechResults', parseSpeechResults);
        this.addEventListener('EvaluatorResults', parseEvaluatorResults);
    },

    startListening: function (options, speakCallback) {
        this.onSpeakCallback = speakCallback;
        exec(null, function(err) { alert(err); }, 'Speech', 'startListening', [options]);
    },

    stopListening: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'stopListening', []);
    },

    cancelListening: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'cancelListening', []);
    },

    startSpeaking: function (text, options) {
        exec(null, function(err) { alert(err); }, 'Speech', 'startSpeaking', [text, options]);
    },

    pauseSpeaking: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'pauseSpeaking', []);
    },

    resumeSpeaking: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'resumeSpeaking', []);
    },

    stopSpeaking: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'stopSpeaking', []);
    },

    startEvaluating: function (text, options, evaluateCallback) {
        this.onEvaluateCallback = evaluateCallback;
        exec(null, function(err) { alert(err); }, 'Speech', 'startEvaluating', [text, options]);
    },

    stopEvaluating: function () {
        exec(null, function(err) { alert(err); }, 'Speech', 'stopEvaluating', []);
    }
};

module.exports = new iflytekSpeech();
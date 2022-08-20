const BACKEND_URL = "https://c150-150-129-206-36.in.ngrok.io"

const SAMPLE_DATA = {
    "hasMoov": true,
    "duration": 153902,
    "timescale": 1000,
    "isFragmented": false,
    "isProgressive": false,
    "hasIOD": false,
    "brands": [
        "isom",
        "isom",
        "iso2",
        "avc1",
        "mp41"
    ],
    "created": "1904-01-01T00:00:00.000Z",
    "modified": "1904-01-01T00:00:00.000Z",
    "tracks": [
        {
            "id": 1,
            "name": "VideoHandler",
            "references": [],
            "edits": [
                {
                    "segment_duration": 114,
                    "media_time": -1,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                },
                {
                    "segment_duration": 153767,
                    "media_time": 6000,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                }
            ],
            "created": "1904-01-01T00:00:00.000Z",
            "modified": "1904-01-01T00:00:00.000Z",
            "movie_duration": 153882,
            "movie_timescale": 1000,
            "layer": 0,
            "alternate_group": 0,
            "volume": 0,
            "matrix": {
                "0": 65536,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 65536,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 1073741824
            },
            "track_width": 1728,
            "track_height": 1080,
            "timescale": 90000,
            "duration": 13849322,
            "samples_duration": 13849322,
            "codec": "avc1.4d4028",
            "kind": {
                "schemeURI": "",
                "value": ""
            },
            "language": "und",
            "nb_samples": 4613,
            "size": 5762035,
            "bitrate": 299557.2779663871,
            "type": "video",
            "video": {
                "width": 1920,
                "height": 1080
            }
        },
        {
            "id": 2,
            "name": "SoundHandler",
            "references": [],
            "edits": [
                {
                    "segment_duration": 153902,
                    "media_time": 0,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                }
            ],
            "created": "1904-01-01T00:00:00.000Z",
            "modified": "1904-01-01T00:00:00.000Z",
            "movie_duration": 153902,
            "movie_timescale": 1000,
            "layer": 0,
            "alternate_group": 1,
            "volume": 1,
            "matrix": {
                "0": 65536,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 65536,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 1073741824
            },
            "track_width": 0,
            "track_height": 0,
            "timescale": 44100,
            "duration": 6787072,
            "samples_duration": 6787072,
            "codec": "mp4a.40.2",
            "kind": {
                "schemeURI": "",
                "value": ""
            },
            "language": "und",
            "nb_samples": 3314,
            "size": 1208017,
            "bitrate": 62794.1471079134,
            "type": "audio",
            "audio": {
                "sample_rate": 44100,
                "channel_count": 2,
                "sample_size": 16
            }
        }
    ],
    "audioTracks": [
        {
            "id": 2,
            "name": "SoundHandler",
            "references": [],
            "edits": [
                {
                    "segment_duration": 153902,
                    "media_time": 0,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                }
            ],
            "created": "1904-01-01T00:00:00.000Z",
            "modified": "1904-01-01T00:00:00.000Z",
            "movie_duration": 153902,
            "movie_timescale": 1000,
            "layer": 0,
            "alternate_group": 1,
            "volume": 1,
            "matrix": {
                "0": 65536,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 65536,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 1073741824
            },
            "track_width": 0,
            "track_height": 0,
            "timescale": 44100,
            "duration": 6787072,
            "samples_duration": 6787072,
            "codec": "mp4a.40.2",
            "kind": {
                "schemeURI": "",
                "value": ""
            },
            "language": "und",
            "nb_samples": 3314,
            "size": 1208017,
            "bitrate": 62794.1471079134,
            "type": "audio",
            "audio": {
                "sample_rate": 44100,
                "channel_count": 2,
                "sample_size": 16
            }
        }
    ],
    "videoTracks": [
        {
            "id": 1,
            "name": "VideoHandler",
            "references": [],
            "edits": [
                {
                    "segment_duration": 114,
                    "media_time": -1,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                },
                {
                    "segment_duration": 153767,
                    "media_time": 6000,
                    "media_rate_integer": 1,
                    "media_rate_fraction": 0
                }
            ],
            "created": "1904-01-01T00:00:00.000Z",
            "modified": "1904-01-01T00:00:00.000Z",
            "movie_duration": 153882,
            "movie_timescale": 1000,
            "layer": 0,
            "alternate_group": 0,
            "volume": 0,
            "matrix": {
                "0": 65536,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 65536,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 1073741824
            },
            "track_width": 1728,
            "track_height": 1080,
            "timescale": 90000,
            "duration": 13849322,
            "samples_duration": 13849322,
            "codec": "avc1.4d4028",
            "kind": {
                "schemeURI": "",
                "value": ""
            },
            "language": "und",
            "nb_samples": 4613,
            "size": 5762035,
            "bitrate": 299557.2779663871,
            "type": "video",
            "video": {
                "width": 1920,
                "height": 1080
            }
        }
    ],
    "subtitleTracks": [],
    "metadataTracks": [],
    "hintTracks": [],
    "otherTracks": [],
    "mime": "video/mp4; codecs=\"avc1.4d4028,mp4a.40.2\"; profiles=\"isom,iso2,avc1,mp41\""
}

export { BACKEND_URL, SAMPLE_DATA }
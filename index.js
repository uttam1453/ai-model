var express = require('express');
var app = express();

var config = require('./config.js')
var cors = require("cors");
var multer = require('multer')
var upload = multer({ dest: 'build/' });

var axios = require("axios");

var AWS = require('aws-sdk');
AWS.config.update({
	region: config.region,
	accessKeyId: config.key,
	secretAccessKey: config.secret
})

var fs = require('fs-extra');
var path = require('path');
const baseUrl = "http://43.204.149.237"


app.use(express.static('build'));
app.use(cors());
var rekognition = new AWS.Rekognition({ region: config.region });

const emtionsForJokes = ["SAD", "ANGRY", "DISGUSTED", "HAPPY",];
const emtionsForQuotes = ["FEAR", "CALM", "CONFUSED"];
//const emtionsForJokes = ["SURPRISED","CALM","FEAR","SAD","ANGRY","CONFUSED","DISGUSTED","HAPPY"];



app.post(`${baseUrl}/api/recognize`, upload.single("image"), async (req, res, next) => {
	var bitmap = fs.readFileSync(req.file.path);
	rekognition.detectFaces(
		{
			"Image": {
				"Bytes": bitmap,
			},
			"Attributes": ['ALL']
		}, (err, data) => {
			matchFace(bitmap, res, data);
			fs.unlinkSync(req.file.path);
		})
});

app.post(`${baseUrl}/api/employee`, upload.single("image"), function (req, res) {
	console.log(req.query)
	var bitmap = fs.readFileSync(req.file.path);
	const id = `${req.query.name}_:_${req.query.employeeId}`
	rekognition.indexFaces({
		"CollectionId": config.collectionName,
		"DetectionAttributes": ["ALL"],
		"ExternalImageId": id,
		"Image": {
			"Bytes": bitmap
		}
	}, (err, data) => {
		fs.unlinkSync(req.file.path);
		if (err) {
			res.send(err);
		} else {
			res.send("UPLOADED");
		}
	})
})


const matchFace = async (bitmap, res, faceDetails) => {
	rekognition.searchFacesByImage({
		"CollectionId": config.collectionName,
		"FaceMatchThreshold": 0,
		"Image": {
			"Bytes": bitmap,
		},
		"MaxFaces": 1
	}, async (err, data) => {
		if (err) {
			res.send(err);
		} else {
			if (data.FaceMatches && data.FaceMatches.length > 0 && data.FaceMatches[0].Face) {
				const response = {
					matched: data.FaceMatches[0].Similarity > 80,
					epmployeeName: data.FaceMatches[0].Face.ExternalImageId.split("_:_")[0],
					employeeId: data.FaceMatches[0].Face.ExternalImageId.split("_:_")[1],
					emotion: (faceDetails.FaceDetails[0].Emotions.filter(e => e.Confidence > 60)[0]).Type,
					isSmiling: faceDetails.FaceDetails[0].Smile.value,
					isSleeping: faceDetails.FaceDetails[0].EyesOpen.value,
					ageRange: `${faceDetails.FaceDetails[0].AgeRange.Low}-${faceDetails.FaceDetails[0].AgeRange.High} years`,
					gender: faceDetails.FaceDetails[0].Gender.value,
					//extra: faceDetails

				}
				if (emtionsForJokes.includes(response.emotion)) {
					response.joke = await getRandomJoke();
				} else if (emtionsForQuotes.includes(response.emotion)) {
					response.quote = await getRandomQuote();

				}
				res.send(response);
			} else {
				res.send("Not recognized");
			}
		}
	});
}




const getRandomJoke = async () => {
	const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
	if (res.data.joke) {
		return res.data.joke;
	}
	const joke = {
		setup: res.data.setup,
		delivery: res.data.delivery
	}
	return joke
}

const getRandomQuote = async () => {
	const res = await axios.get('https://api.quotable.io/random');

	return `${res.data.content}  \n- ${res.data.author}`;
}

app.listen(8080, function () {
	console.log('Listening on port 8080!');
})
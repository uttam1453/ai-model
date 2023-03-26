var express = require('express');
var app = express();

var config = require('./config.js')
var cors = require("cors");
var multer = require('multer')
var upload = multer({ dest: 'build/' });
const Employee = require("./employee");

var axios = require("axios");

var AWS = require('aws-sdk');
AWS.config.update({
	region: config.region,
	accessKeyId: config.key,
	secretAccessKey: config.secret
})

var fs = require('fs-extra');
var path = require('path');

app.use(express.static('build'));
app.use(cors());
var rekognition = new AWS.Rekognition({ region: config.region });
config.connectDB();
const emtionsForJokes = ["SAD", "ANGRY", "DISGUSTED", "HAPPY",];
const emtionsForQuotes = ["FEAR", "CALM", "CONFUSED"];
//const emtionsForJokes = ["SURPRISED","CALM","FEAR","SAD","ANGRY","CONFUSED","DISGUSTED","HAPPY"];



app.post('/api/recognize', upload.single("image"), async (req, res, next) => {
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

app.get('/api/employee/:id', upload.single("image"), async (req, res) => {
	const emp = await Employee.find({ employeeId: req.params.id }).exec();
	if (emp.length > 0) {
		res.send(emp[0])
	} else {
		res.status(400)
	}
});

app.post('/api/employee', upload.single("image"), async (req, res) => {
	try {
		const id = req.query.employeeId;
		const emp = await Employee.find({ employeeId: id }).exec();
		if (emp.length > 0) {
			res.status(400).send(emp[0].employeeName);
			return;
		}
		var bitmap = fs.readFileSync(req.file.path);
		const employee = new Employee({
			employeeName: req.query.name,
			employeeId: req.query.employeeId,
			email: req.query.email
		});
		employee.save();
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
	} catch (err) {
		console.log(err);
	}
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
				const employee = await Employee.find({ employeeId: data.FaceMatches[0].Face.ExternalImageId }).exec();
				const emotion = faceDetails.FaceDetails[0].Emotions.filter(e => e.Confidence > 40)
				if (employee.length > 0) {
					const data = {
						emotion: emotion.length > 0 ? emotion[0].Type : 'NO-DETECT',
						date: new Date()
					}
					const emotions = employee[0].emotions ? employee[0].emotions : [];
					emotions.push(data);
					Employee.findByIdAndUpdate(employee[0]._id, { emotions }).exec();
				}

				const response = {
					matched: data.FaceMatches[0].Similarity > 80,
					epmployeeName: employee[0].employeeName,
					employeeId: employee[0].employeeId,
					emotion: emotion.length > 0 ? emotion[0].Type : 'NO-DETECT',
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
				const params = new URLSearchParams();
				params.append('channel', 'bot');
				params.append('text', response?.joke?.setup ? `Ques: ${response?.joke?.setup} \n Ans: ${response?.joke?.delivery}` : (response?.joke ? response?.joke : response?.quote));
				//const body = {};
				axios.post('https://slack.com/api/chat.postMessage', params, {
					headers: {
						'Authorization': 'Bearer xoxb-5009389299027-5009401865987-j48wRR0NEMOVnD1kd0V97dz6'
					}
				})
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
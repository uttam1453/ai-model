import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Spinner
} from "react-bootstrap";
import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from "react-webcam";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [detectFace, setDetectFace] = useState(false);
  const [detectFaceDone, setDetectFaceDone] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [img, setImg] = useState();
  const [addEmployee, setAddEmployee] = useState(false);
  const [employeeId, setEmployeeId] = useState();
  const [employeeName, setEmployeeName] = useState();
  const camRef = useRef();
  const inputRef = useRef(null);

  const baseUrl = 'http://43.204.149.237';

  const emtionsForJokes = ["SAD", "ANGRY", "DISGUSTED"];

  const campture = useCallback(() => {
    const imgSrc = camRef?.current?.getScreenshot();
    if (imgSrc) {
      setImg(imgSrc)
    }
  })

  const base64toFile = async (data, filename, mimeType) => {
    return (fetch(data)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }
  const detectface = async () => {
    setIsLoading(true);
    const file = await base64toFile(img, "temp.jpeg", "image/jpeg")
    const formdata = new FormData();
    formdata.append("image", file);
    axios.post(`${baseUrl}/api/recognize`, formdata, {
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
      }
    }).then(res => {
      console.log(res);
      setIsLoading(false);
      setDetectFaceDone(res.data)
      setDetectFace(true);
    })
  }

  const handleFileChange = (event) => {
    const files = event.target.files;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.addEventListener('load', (e) => {
      let contentType = e.target?.result.split(";base64")[0];
      contentType = contentType.slice(5);
      if (contentType.includes("jpeg") || contentType.includes("jpg") || contentType.includes("png")) {
        setImg(e.target?.result);
      } else {
        alert("Please select image file");
      }
    });

  }

  const callAddEmployee = async (e) => {
    setIsLoading(true);
    const file = await base64toFile(img, "temp.jpeg", "image/jpeg")
    const formdata = new FormData();
    formdata.append("image", file);
    const empName = employeeName.replaceAll(" ", ".")
    axios.post(`${baseUrl}/api/employee?name=${empName}&employeeId=${employeeId}`, formdata, {
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
      }
    }).then(res => {
      setIsLoading(false);
      setEmployeeId();
      setEmployeeName();
      toast.success("Employee details added successfully")
    })


  }

  return (
    <div className="App">
      <ToastContainer />
      <Container fluid>
        <Row style={{ margin: '20px' }}><Col lg="12"><h1>Cheer me up!!!</h1></Col></Row>
        <Row>
          <Col lg="6">
            <Row>
              <Col lg="12">
                {img ?
                  <img src={img} width="640" height="480" /> :
                  <Webcam ref={camRef} mirrored={false} screenshotFormat="image/jpeg" />
                }
              </Col>
            </Row>
            {!img && <Row>

              <Col lg="5">
                <Button onClick={campture}>Capture</Button>
                <img src={img} />
              </Col>
              <Col lg="1">
                OR
                <img src={img} />
              </Col>
              <Col lg="4">
                <input
                  style={{ display: 'none' }}
                  ref={inputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                />
                <Button onClick={() => inputRef?.current?.click()} >select file</Button>
                <img src={img} />
              </Col>
            </Row>}

            {img && <Row>

              <Col lg="12">
                <Button variant='danger' onClick={() => { setImg(); setAddEmployee(false); setDetectFace(false); setDetectFaceDone() }}>Clear</Button>
              </Col>
            </Row>}

          </Col>











          <Col lg="6">
            <Row>
              <Col md="6">
                <Button disabled={!img} variant={img ? "primary" : "secondary"} onClick={() => { setAddEmployee(true); setDetectFace(false); setDetectFaceDone() }}>Add new employee</Button>
              </Col>
              <Col md="6">
                <Button disabled={!img} variant={img ? "primary" : "secondary"} onClick={() => { setDetectFace(); setDetectFaceDone(); detectface(); setAddEmployee(false) }}>Recognize employee</Button>
              </Col>
            </Row>
            <Row style={{ margin: '30px' }}>
              <Col lg="12">
                {isLoading && <Spinner />}
                {img && detectFace && <Card>
                  <Card.Header>
                    <Row><b style={{ marginRight: '10px' }}>Employee Name : </b>{detectFaceDone.epmployeeName}</Row>
                    <Row><b style={{ marginRight: '10px' }}>Employee Id   : </b>{detectFaceDone.employeeId}</Row>
                  </Card.Header>
                  <Card.Body>
                    <Row><b style={{ marginRight: '10px' }}>Mood : </b><h5 style={{ color: emtionsForJokes.includes(detectFaceDone.emotion) ? 'RED' : "GREEN" }}>{detectFaceDone.emotion}</h5></Row>
                    <Row><b style={{ marginRight: '10px' }}>Cheer type : </b>{detectFaceDone?.joke ? 'JOKE' : 'QUOTE'}</Row>
                  </Card.Body>
                  <Card.Footer><b>Message: </b>{detectFaceDone?.joke?.setup ? `Ques: ${detectFaceDone?.joke?.setup} \n Ans: ${detectFaceDone?.joke?.delivery}` : (detectFaceDone?.joke ? detectFaceDone?.joke : detectFaceDone?.quote)}</Card.Footer>
                </Card>}
                {img && addEmployee && !isLoading && <Form>
                  <Form.Group className="mb-3" >
                    <Form.Label>Employee Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" onChange={(e) => { setEmployeeName(e?.target?.value) }} />
                  </Form.Group>

                  <Form.Group className="mb-3" >
                    <Form.Label>Employee Id</Form.Label>
                    <Form.Control type="text" placeholder="Enter employee ID" onChange={(e) => { setEmployeeId(e?.target?.value) }} />
                  </Form.Group>
                  <Button variant="primary" onClick={(e) => { callAddEmployee(e) }} >
                    Submit
                  </Button>
                </Form>
                }
              </Col>
            </Row>
          </Col>
        </Row>


      </Container>

    </div>
  );
}

export default App;

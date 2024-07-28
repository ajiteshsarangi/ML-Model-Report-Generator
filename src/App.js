import "./App.css";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import List from "./components/List";
import Alert from "./components/Alert";
import { UilPlus } from "@iconscout/react-unicons";
import { UilPen } from "@iconscout/react-unicons";
import { UilTrashAlt } from "@iconscout/react-unicons";
import Chart from "./components/Chart";
import Scat from "./components/Scat";
import Piec from "./components/Piec";
import { Bar } from "react-chartjs-2";
import { v4 as uuid } from "uuid";
import LightTeamA from "./components/LightTeamA";
import * as XLSX from "xlsx";
import { UserData } from "./Data";
import DownloadLink from "react-download-link";
let sentiment;

const getLocalStorage = () => {
  let list = localStorage.getItem("list");
  if (list) {
    return JSON.parse(localStorage.getItem("list"));
  } else {
    return [];
  }
};

function App(props) {
  const unique_id = uuid();
  const small_id = unique_id.slice(0, 3);
  const [name, setName] = useState("");
  const [list, setList] = useState(getLocalStorage());
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);
  const [alert, setAlert] = useState({ show: false, msg: "hello", type: "successs" });
  const [items, setItems] = useState([]);
  let [text, setText] = useState(0);
  let [score, setScore] = useState(0);
  const [userData, setUserdata] = useState({
    labels: [],
    // labels: items.map((item) => item.model_output),
    datasets: [
      {
        label: "Model Score",
        data: [],
        // data: items.map((data) => data.model_target),
        borderColor: "blue",
        borderWidth: 1.5,
        backgroundColor: "Blue",
      },
    ],
  });
  // read excel file and generate the chart-----------------------------------------
  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setItems(d);
      setUserdata({
        // labels: numbers.map((item, index) => index),
        labels: d.map((item, index) => index),
        datasets: [
          {
            label: "Monthy Salary",
            // data: [1, 0],
            data: d.map((data) => data.monthly_salary),
            backgroundColor: "blue",
            borderColor: "blue",
            borderWidth: 1.5,
          },
        ],
      });
    });
  };
  //-----------------------------------------------------------
  // binning ------------------------------------

  var bins = [];
  var binCount = 0;
  var interval = 500;
  var numOfBuckets = 1;

  //Setup Bins
  for (var i = 0; i < numOfBuckets; i += interval) {
    bins.push({
      binNum: binCount,
      minNum: i,
      maxNum: i + interval,
      count: 0,
    });
    binCount++;
  }

  //Loop through data and add to bin's count
  for (var i = 0; i < userData.datasets.length; i++) {
    var item = userData.datasets[i];
    for (var j = 0; j < bins.length; j++) {
      var bin = bins[j];
      if (item > bin.minNum && item <= bin.maxNum) {
        bin.count++;
        break; // An item can only be in one bin.
      }
    }
  }
  console.log(userData.datasets);
  console.log(bins);
  // ----------------------------------------------------------------
  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      // display alert
    } else if (name && isEditing) {
      setList(
        list.map((item) => {
          if (item.id === editID) {
            return { ...item, title: name };
          }
          return item;
        })
      );
      setName("");
      setIsEditing(false);
      setEditID(null);
    } else {
      // show alert
      const newItem = {
        id: small_id,
        title: name,
        sentifn: Math.floor(score.toFixed(5) * 1000),
      };

      setList([...list, newItem]);
      setName("");
      // setText("");
    }
  };

  const clearList = () => {
    setList([]);
  };
  const removeItem = (id) => {
    setList(list.filter((item) => item.id !== id));
  };

  const editItem = (id) => {
    const specificItem = list.find((item) => item.id === id);
    setIsEditing(true);
    setEditID(id);
    setName(specificItem.title);
  };
  //
  console.log(items);
  // setUserdata(items);

  console.log(userData);

  useEffect(() => {
    localStorage.setItem("list", JSON.stringify(list));
  }, [list]);

  // ------------------------------------------
  const [userData2, setUserdata2] = useState({
    labels: [1, 2],
    // labels: items.map((item) => item.model_output),
    datasets: [
      {
        label: "Goodness Score",
        data: [0.1, 0.5],
        // data: items.map((data) => data.model_target),
        borderColor: "blue",
        borderWidth: 1.5,
        backgroundColor: "yellow",
      },
    ],
  });
  return (
    <div>
      <section className="text-gray-600 body-font relative">
        <div className="container px-5 py-8 mx-auto">
          <div className="flex flex-col text-center w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              ML Model Data Visualizer
            </h1>
            <a href="model_data.xlsx" download={"model_data.xlsx"}>
              <h4 className="downloadBtn" style={{ margin: "auto" }}>
                Download Sample Dataset
              </h4>
            </a>
          </div>
          <form onSubmit={handleSubmit}>
            {alert.show && <Alert {...alert} />}
            <div className="lg:w-1/2 md:w-2/3 mx-auto">
              <div className="flex flex-wrap -m-2">
                <div className="p-2 w-full">
                  <div className="relative">
                    <label htmlFor="message" className="leading-7 text-sm text-gray-600">
                      Write about your model
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={name}
                      onChange={handleChange}
                      className={`w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-${props.theme}-500 focus:bg-white focus:ring-2 focus:ring-${props.theme}-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out`}
                    ></textarea>
                  </div>
                </div>
                <div className="p-2 w-full">
                  <button
                    type="submit"
                    class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                  >
                    {isEditing ? "Edit" : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={clearList}
                    class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                  >
                    Clear List
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      <div>
        <label htmlFor="files" class="drop-container">
          <span class="drop-title">Drop files here</span>
          or
          <input
            id="files"
            type="file"
            accept="file/*"
            required
            onChange={(e) => {
              const file = e.target.files[0];
              readExcel(file);
            }}
          />
        </label>
      </div>
      <table class="table container">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        {/* <tbody>
          {items.map((d) => (
            <tr>
              <th>{d.model_output}</th>
              <td>{d.model_target}</td>
            </tr>
          ))}
        </tbody> */}
      </table>
      <List items={list} remove={removeItem} edit={editItem} />
      <div style={{ width: "80vw", height: "80vh", textAlign: "center", margin: "auto" }}>
        <Chart chartData={userData} />
        <Scat chartData={userData} />
        <Piec chartData={userData} />
      </div>
    </div>
  );
}

export default App;

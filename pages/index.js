import WrongNetworkMessage from "../components/WrongNetworkMessage";
import ConnectWalletButton from "../components/ConnectWalletButton";
import TodoList from "../components/TodoList";
import TaskAbi from "../ABI/TaskContract.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Task from "../components/Task";

const TaskAddress = "0xC04cBD744b783A28B6c8B1C255894Cec6Fe0eA9c";

export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    connectWallet();
    getAllTasks();
  }, []);

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("connected to chain:", chainId);

      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("you are not connected to the rinkeby testnet!!");
        setCorrectNetwork(false);
        return;
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found account:", accounts[0]);

      setIsUserLoggedIn(true);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskAddress,
          TaskAbi.abi,
          signer
        );
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("eth object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add tasks from front-end onto the blockchain
  const addTask = async (e) => {
    e.preventDefault();
    let task = {
      taskText: taskDescription,
      isDeleted: false,
    };

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskAddress,
          TaskAbi.abi,
          signer
        );

        const addTask = await TaskContract.addTask(
          task.taskText,
          task.isDeleted
        );
        setTasks([...tasks, task]);
        console.log("Task added");
      } else {
        console.log("eth object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
    setTaskDescription("");
  };

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = (key) => async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskAddress,
          TaskAbi.abi,
          signer
        );
        const deletedTask = await TaskContract.deleteTask(key, true);
        console.log("deleted task");
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("eth does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#97b5fe] h-screen w-screen flex justify-center py-6">
      {!isUserLoggedIn ? (
        <ConnectWalletButton connectWallet={connectWallet} />
      ) : correctNetwork ? (
        <TodoList
          deleteTask={deleteTask}
          tasks={tasks}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          addTask={addTask}
        />
      ) : (
        <WrongNetworkMessage />
      )}
    </div>
  );
}

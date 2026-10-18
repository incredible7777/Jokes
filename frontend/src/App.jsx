import { useEffect, useState } from 'react'
import axios from 'axios'
function App() {
  const [jokes,setJokes]=useState([])
  const [index,setIndex]=useState(0)
  useEffect(()=>{
    axios.get("/api/jokes")
    .then((response)=>{
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log(error)
    })
  }, [])
  const HandleJoke=()=>{
    if(jokes.length>0){
      setIndex((prevIndex)=> (prevIndex+1)%jokes.length)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300">
      <h2 className=" text-2xl ">Hey Buddy</h2>
      <p> Total jokes: {jokes.length}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md my-2 on hover:bg-blue-600 cursor-pointer"
      onClick={HandleJoke}
      disabled={jokes.length===0}
      >Next Joke</button>
      
      {jokes.length>0 && (
        <div>
          <h3>Question: {jokes[index].question}</h3>
          <p>Answer: {jokes[index].answer}</p>
        </div>
      )}
    </div>
  )
}

export default App

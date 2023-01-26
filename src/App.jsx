import { useState, useEffect } from 'react'
import './App.css'
import './normal.css';

import { Configuration, OpenAIApi } from "openai";

function App() {

  const configuration = new Configuration({
    organization: import.meta.env.VITE_ORG,
    apiKey: import.meta.env.VITE_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const [input, setInput] = useState("")
  const [currentModel, setCurrentModel] = useState('text-davinci-003')
  const [chatLog, setChatLog] = useState([
    {
      user: "gpt",
      message: "How can I help you my master?"
    }
  ])

  const [currentTemperature, setTemperature] = useState(0);
  const temperature = [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const [models, setModels] = useState([])

  useEffect(() => {
    getEngines()
  }, [])

  const clearChat = () => setChatLog([{
    user: "gpt",
    message: "How can I help you my master?"
  }]);

  function getEngines() {
    const response = openai.listEngines().then(res => setModels(res.data.data))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    let newChatLog = [...chatLog, { user: "me", message: `${input}` }];
    console.log(newChatLog);
    await setChatLog(newChatLog)

    const response = await openai.createCompletion({
      model: currentModel,
      prompt: input,
      max_tokens: 100,
      temperature: currentTemperature,
    });

    await setInput("")
    console.log(response.data)
    newChatLog = [...chatLog, { user: "gpt", message: response.data.choices[0].text.toString().replace('\n\n', '\n') }];
    await setChatLog(newChatLog);
  }

  return (
    <div className="flex text-white text-center">
      {/* Side Bar */}
      <aside className='w-[260px] p-[16px] bg-[#202123]'>
        <div className='p-[12px] border border-white rounded-[5px] text-left transition-[0.25s] hover:bg-[rgba(255,255,255,0.1)]' onClick={clearChat}>
          <span className='pl-[6px] pr-[12px]'>+</span>
          New Chat
        </div>

        <div className='text-xl font-semibold text-left my-4'>
          Models
        </div>
        <select value={currentModel} onChange={(e) => setCurrentModel(e.target.value)} className='w-[200px] h-auto p-[12px] rounded-[5px] text-left transition-[0.25s] bg-[#202123] overflow-x-hidden border'>
          {models.map((model, index) => (
            <option key={index} value={model.id}>{model.id}</option>
          ))}
        </select>
        <div className='text-start text-sm my-3 w-[200px]'>
          The model parameter controls the engine used to generate the response. Davinci produces best results.
        </div>

        <div className='text-xl font-semibold text-left mt-8 mb-4'>
          Temperature
        </div>
        <select value={currentTemperature} onChange={(e) => setTemperature(e.target.value)} className='w-[200px] h-auto p-[12px] rounded-[5px] text-left transition-[0.25s] bg-[#202123] overflow-x-hidden border'>
          {temperature.map((temp, index) => (
            <option key={index} value={temp}>{temp}</option>
          ))}

        </select>
        <div className='w-[200px] h-10 pt-2 px-2 bg-white bg-opacity-20 my-4 rounded-md text-start' onClick={() => setTemperature(0)}>
          0 - Logical
        </div>
        <div className='w-[200px] h-10 pt-2 px-2 bg-white bg-opacity-20 my-4 rounded-md text-start' onClick={() => setTemperature(0.5)}>
          0.5 - Balanced
        </div>
        <div className='w-[200px] h-10 pt-2 px-2 bg-white bg-opacity-20 my-4 rounded-md text-start' onClick={() => setTemperature(1)}>
          1 - Creative
        </div>
        <div className='text-start text-sm my-3 w-[200px]'>
          The temperature parameter controls the randomness of the model. 0 is the most logical, 1 is the most creative.
        </div>
      </aside>
      {/* Chat-Box */}
      <section className='w-screen h-screen bg-[#343541] relative'>

        {/* Chat-Log */}
        <div className='text-left h-full mb-[50px] overflow-y-scroll'>
          {chatLog.map((message, index) =>
            <ChatMessage key={index} message={message} />
          )}
          <div className='h-24'></div>
        </div>

        <div className='px-[24px] absolute bottom-[12px] left-0 right-[12px] mx-20'>
          <form onSubmit={handleSubmit} className=''>
            <input value={input} onChange={(e) => setInput(e.target.value)} className='bg-[#40414f] w-11/12 rounded-[5px] border-none m-[12px] outline-none shadow-md p-[6px] h-12 px-6'>
            </input>
          </form>
        </div>
      </section>
    </div>
  )
}

export default App


const ChatMessage = ({ message }) => {
  if (message.user === "gpt") {
    return <div className='bg-[#444654]'>
      <div className="max-w-[640px] mx-auto flex p-[12px] px-[24px]">
        {/* Avatar */}
        <div className='bg-[#0da37f] rounded-full w-[40px] h-[40px] min-w-[40px] items-center flex align-middle justify-center'>
          <img src='chat-gpt-logo.jpg' className='w-[40px] h-[40px] rounded-full' />
        </div>
        {/* message */}
        <div className='px-[40px] h-min'>{message.message}</div>
      </div>
    </div>
  }
  else {
    return (
      <div className='' >
        <div className="max-w-[640px] mx-auto flex p-[12px] px-[24px] ">
          {/* Avatar */}
          <div className='bg-white rounded-full w-[40px] h-[40px]'>
            <img src='user.png' className='w-[40px] h-[40px] rounded-full' />
          </div>
          {/* message */}
          <div className='px-[40px]'>{message.message}</div>
        </div>
      </div>
    );
  }
}

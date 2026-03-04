import React, { useState, useEffect, useRef } from 'react'
import { use } from 'react';

function MyComponent(){
    
    const [name, setName] = useState("Guest");
    const [quantity, setQuality] = useState(1);
    const [comment, setComment] = useState("");
    const [payment, setPayment] = useState("");
    const [shipping, setShipping] = useState("");
    const [cars, setCars] = useState([]);   
    const [foods, setFoods] = useState(["Pizza", "Sushi", "Tacos"]);
    const [carYear, setCarYear] = useState(new Date().getFullYear());
    const [carMake, setCarMake] = useState("");
    const [carModel, setCarModel] = useState(""); 
    const [count, setCount] = useState(0);
    const [color, setColor] = useState("green");
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const inputRef3 = useRef(null);

   
    useEffect(() => {
        document.title = `Count: ${count} (${color})`;

        window.addEventListener("resize", handleResize);
        console.log("EVENT LISTENER ADDED");

        return () => {
            window.removeEventListener("resize", handleResize);
            console.log("EVENT LISTENER REMOVED");
        }
    }, [count, color]);

    useEffect(() => {
        document.title = `size: ${width} x ${height}`;
    }, [width, height]);

    function handleResize(){
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    function addCount(){
        setCount(c => c + 1);
    }

    function subtractCount(){
        setCount(c => c - 1);
    }

    function changeColor(){
        setColor(c => c === "green" ? "red" : "green");

    }   

    function handleAddCar(){
        const newCar = {year: carYear, 
                        make: carMake, 
                        model: carModel };
        setCars(c => [...c, newCar]);

        setCarYear(new Date().getFullYear());
        setCarMake("");
        setCarModel("");
    }

    function handleRemoveCar(index){
        setCars(c => c.filter((_, i) => i !== index));
    }

    function handleYearChange(event){
        setCarYear(event.target.value);
    }

    function handleMakeChange(event){
        setCarMake(event.target.value);
    }

    function handleModelChange(event){
        setCarModel(event.target.value);
    }

    function handleAddFood(){
        const newFood = document.getElementById('foodInput').value;
        document.getElementById('foodInput').value = "";

        setFoods(f => [...f, newFood]);
    }
    function handleRemoveFood(index){

        setFoods(foods.filter((_, i) => i !== index))
        
    }

    function handleNameChange(event){
        setName(event.target.value);
    }
    
    function handleQuantityChange(event){
        setQuality(event.target.value);
    }

    function handleCommentChange(event){
        setComment(event.target.value);
    }

    function handlePaymentChange(event){
        setPayment(event.target.value);
    }

    function handleShippingChange(event){
        setShipping(event.target.value);
    }

    useEffect(() => {
        console.log("COMPONENT RENDERED");
    });

    function handleClick1(){
        inputRef1.current.focus();
        inputRef1.current.style.backgroundColor = "yellow";
        inputRef2.current.style.backgroundColor = "";
        inputRef3.current.style.backgroundColor = "";
    }

     function handleClick2(){
        inputRef2.current.focus();
        inputRef1.current.style.backgroundColor = "";
        inputRef2.current.style.backgroundColor = "yellow";
        inputRef3.current.style.backgroundColor = "";
    }

     function handleClick3(){
        inputRef3.current.focus();
        inputRef1.current.style.backgroundColor = "";
        inputRef2.current.style.backgroundColor = "";
        inputRef3.current.style.backgroundColor = "yellow";
    }

    
    return( <div>
                <button onClick={handleClick1}>
                    Click me 1!
                </button>
                <input ref={inputRef1}/>

                <button onClick={handleClick2}>
                    Click me 2
                </button>
                <input ref={inputRef2}/>

                <button onClick={handleClick3}>
                    Click me 3!
                </button>
                <input ref={inputRef3}/>

                <p>Window Width: {width}px</p>
                <p>Window Height: {height}px</p>
                <p style={{color: color}}>Count: {count} <br/></p>
                <button className="count-button" onClick={addCount}>Add</button>
                <button className="count-button" onClick={subtractCount}>Subtract</button>
                <button className="count-button" onClick={changeColor}>Change Color</button>
                <div>
                    <h2>List of car objects</h2>
                    <ul>
                        {cars.map((car, index) =>
                        <li key ={index} onClick={() => handleRemoveCar(index)}>
                            {car.year} {car.make} {car.model}
                        </li>)}

                    </ul>

                    <input type="number" value={carYear} onChange={handleYearChange}/><br/>
                    <input type="text" value={carMake} onChange={handleMakeChange} 
                            placeholder="Enter Car Make"/><br/>
                    <input type="text" value={carModel} onChange={handleModelChange} 
                            placeholder="Enter Car Model"/><br/>
                    <button onClick={handleAddCar}>Add Car</button>


                </div>
                <input value={name} onChange={handleNameChange} />
                <p>Name: {name}</p>

                <input value={quantity} onChange={handleQuantityChange} type ="number" />
                <p>Quantity: {quantity}</p>

                <textarea value={comment} onChange={handleCommentChange}
                placeholder="Enter your comment here..." />
                <p>Comment: {comment}</p>

                <select value={payment} onChange={handlePaymentChange}>
                    <option value="">Select an option<option value=""></option></option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Giftcard">Giftcard</option>
                </select>
                <p>Payment method: {payment}</p>

                <label>
                        <input type="radio" value="Pick Up"
                        checked={shipping === "Pick Up"}
                        onChange={handleShippingChange} />
                    Pick Up
                </label><br/>
                <label>
                        <input type="radio" value="Delivery"
                        checked={shipping === "Delivery"}
                        onChange={handleShippingChange} />
                    Delivery
                </label>
                <p>Shipping: {shipping}</p>
                
                <div>
                    <h2>List of foods</h2>
                    <ul>
                        {foods.map((food, index) => 
                        <li key={index} onClick={() => handleRemoveFood(index)}>
                            {food} 
                        </li> )}
                    </ul>
                    <input type="text" id='foodInput' placeholder="Enter a food name" />
                    <button onClick={handleAddFood}>Add Food</button>
                </div>
            </div>
    );
}

export default MyComponent
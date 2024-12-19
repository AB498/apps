(() => {
    let Component = (props) => {
        let { homePage } = props || {};
        return <div>
            <div>Auth{uuid().slice(0, 5)}</div>
            {homePage}  
        </div>
    }

    return Component;
})()
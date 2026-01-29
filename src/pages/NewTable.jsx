import { Fragment } from "react"
import Header from "../components/Header";
import '../css/NewTable.css'
import HeaderNew from "../newPages/HeaderNew";

const NewTable = () => {
    return (
        <Fragment>
            <HeaderNew />
            <main className="new">
                <h2>Create a new Table</h2>
                <div className="createNew">
                    <label htmlFor="newTable">
                        New Table Name/Number :
                        <input id="newTable" type="text" placeholder="Enter details" />
                        <button>Create</button>
                    </label>
                </div>
                <div className="seeQR">
                    <label htmlFor="QR"></label>
                    See QR :
                    <select id="QR">
                        <option value="Select Table">Select Table</option>
                        <option value="Table 1">Table 1</option>
                        <option value="Table 2">Table 2</option>
                        <option value="Table 3">Table 3</option>

                    </select>
                </div>
                <div className="qrSpace">qr space</div>
            </main>
        </Fragment>
    )
}

export default NewTable;
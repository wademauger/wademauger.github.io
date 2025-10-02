export default function Table({ titles, elements }) {
    return (<table class="table-auto ingredient-table"> 
        <thead>
            <tr>
                {titles.map(title => <th>{title}</th>)}
            </tr>
        </thead>
        <tbody>
            {elements.map(row => {
                return <tr>{Object.values(row).map(cell => <td>{cell}</td>)}</tr>;
            })}
        </tbody>
    </table>);
}
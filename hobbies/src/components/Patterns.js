import Header from './header';
import '../App.css';
import {TrapezoidDisplay, Trapezoid} from '../AIknitting';

function Patterns() {
  const testSweaterFront = new Trapezoid(10, 9, 12, 0, 0, [new Trapezoid(0, 1, 1), new Trapezoid(4, 4, 3), new Trapezoid(0, 2, 2), new Trapezoid(4, 4, 3), new Trapezoid(0, 1, 1), ]);
  const testSweaterBack = new Trapezoid(10, 9, 12, 0, 0, [new Trapezoid(4, 12, 3)]);
  const testSleeve = new Trapezoid(4, 10, 10, 0, 0, [new Trapezoid(15, 10, 25, 0, 0, [new Trapezoid(10, 25, 3)])]);
  return (
    <div className="App">
      <Header />
      patterns
      <TrapezoidDisplay trapezoid={testSleeve}></TrapezoidDisplay>
      <TrapezoidDisplay trapezoid={testSweaterBack}></TrapezoidDisplay>
      <TrapezoidDisplay trapezoid={testSweaterFront}></TrapezoidDisplay>
    </div>
  );
}

export default Patterns;
import { createCanvas, fillRect, line, rgba } from '../../src/index.ts';
import { defineExampleProject } from '../example-project.ts';

const SIZE = 16;

export const smokeExampleProject = defineExampleProject({
  id: 'smoke',
  width: SIZE,
  height: SIZE,
  render: () => {
    const canvas = createCanvas(SIZE, SIZE, rgba(22, 28, 45));

    fillRect(canvas, 1, 1, 14, 14, rgba(36, 44, 68));
    fillRect(canvas, 4, 4, 8, 8, rgba(232, 235, 242));
    fillRect(canvas, 6, 6, 4, 4, rgba(82, 193, 119));
    line(canvas, 0, 0, SIZE - 1, SIZE - 1, rgba(255, 189, 89));
    line(canvas, SIZE - 1, 0, 0, SIZE - 1, rgba(255, 110, 90));

    return canvas;
  },
});

export const renderSmokeExample = () => smokeExampleProject.render();

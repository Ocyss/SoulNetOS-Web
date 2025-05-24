export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'zinc',
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    table: {
      slots: {
        td: 'whitespace-nowrap overflow-hidden text-ellipsis',
      },
    },
  },
})

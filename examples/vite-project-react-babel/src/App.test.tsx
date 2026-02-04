import {describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import {App} from "./App"
import '@testing-library/jest-dom/vitest'
import { userEvent } from "@testing-library/user-event"

describe("App", () => {
  afterEach(() => {
    cleanup();
  })

  it('Should render default messages in english and handle language switching', async () => {
    render(<App/>)
    const user = userEvent.setup()

    const textEl = await screen.findByTestId('edit-text')

    expect(textEl.textContent).toBe("Edit src/App.tsx and save to test HMR")

    await user.click(await screen.findByRole('button', { name: "Polish"}))
    await waitFor(() => expect(textEl.textContent).toBe("Edytuj src/App.tsx i zapisz, aby przetestować HMR"))
  })

  it('Should render plural message in EN', async () => {
    render(<App/>)
    const user = userEvent.setup()

    const pluralBtn = await screen.findByTestId('plural-button')

    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"0 months"`)

    await user.click(pluralBtn)
    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"1 month"`)

    await user.click(pluralBtn)
    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"2 months"`)
  })

  it('Should render plural message in PL', async () => {
    render(<App/>)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: "Polish"}))

    const pluralBtn = await screen.findByTestId('plural-button')

    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"0 miesięcy"`)

    await user.click(pluralBtn)
    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"1 miesiąc"`)

    await user.click(pluralBtn)
    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"2 miesiące"`)

    await user.click(pluralBtn)
    await user.click(pluralBtn)
    await user.click(pluralBtn)
    expect(pluralBtn.textContent).toMatchInlineSnapshot(`"5 miesięcy"`)
  })

  it('Should render using `t` from `useLingui` macro', async () => {
    render(<App/>)
    const user = userEvent.setup()

    const pluralBtn = await screen.findByTestId('plural-button')

    expect(pluralBtn).toHaveAttribute('title', `Click on this button to test plurals`)
    await user.click(await screen.findByRole('button', { name: "Polish"}))

    await waitFor(() => expect(pluralBtn).toHaveAttribute('title', `Kliknij ten przycisk, aby przetestować formy liczby mnogiej`))
  })

  it('Should render lazy messages and `t`', async () => {
    render(<App/>)
    const user = userEvent.setup()

    const msgExampleEl = await screen.findByTestId('msg-example')

    expect(msgExampleEl.textContent).toMatchInlineSnapshot(`"Red Blue Orange "`);

    await user.click(await screen.findByRole('button', { name: "Polish"}))

    await waitFor(() =>     expect(msgExampleEl.textContent).toBe(`Czerwony Niebieski Pomarańczowy `))
  })
})
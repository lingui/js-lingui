import { combineReducers, createStore } from "redux"
import { reducer as formReducer } from "redux-form"

const initialI18nState = {
  language: "en"
}

export const setLanguage = language => ({
  type: "i18n/SET_LANGUAGE",
  payload: { language }
})

function i18nReducer(state = initialI18nState, action) {
  if (action === undefined) return state

  switch (action.type) {
    case "i18n/SET_LANGUAGE":
      return { ...state, language: action.payload.language }
    default:
      return state
  }
}

const reducer = combineReducers({
  i18n: i18nReducer,
  form: formReducer
})

export default createStore(reducer)

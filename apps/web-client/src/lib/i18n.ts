import i18n from "i18next";
import { z } from "zod";
// import { initReactI18next } from 'react-i18next';
import translation from "zod-i18n-map/locales/it/zod.json";

i18n
  // .use(initReactI18next)
  .init({
    fallbackLng: "it",
    lng: "it",
    resources: {
      it: { zod: translation },
    },
  }, (_, t) => {
    const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
      if (issue.code === "invalid_type")
        return { message: "Campo invalido" };
      return { message: t(`zod:errors.${issue.code}`, { ...issue }) };
    };

    z.setErrorMap(customErrorMap);
  });
export default i18n;

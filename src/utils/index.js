const createHttpError = require("http-errors");

exports.validatePayload = (payload, schema) => {
  const options = {
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const result = schema.validate(payload, options);
  if (result.error) throw createHttpError(422, result.error.details[0].message);
};

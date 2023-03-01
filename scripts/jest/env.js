// avoid snapshot of cli output mismatching because
// of different ways to run test
process.env.npm_config_user_agent = "yarn"

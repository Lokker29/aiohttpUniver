# aiohttpUniver

## Required
- python3.6 and above
- pip

## Install
```
pip install -r requirements.txt
```

## Start
```
python main.py
```

## Docker
You can run application using Docker:
```
docker run --name=chat -p 29006:29006 -d lokker2/chatcpp bash -c "python main.py"
```

## Host and Port
Your chat application is available on `http://<your_ip>:29006/`. Open it in browser
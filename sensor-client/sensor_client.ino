#include <SoftwareSerial.h>
#define RX_PIN 10
#define TX_PIN 11

String AP = "";
String PASS = "";

int count_time_command;
bool command_success = false;
int temp = 1;

SoftwareSerial esp8266(RX_PIN, TX_PIN);

void send_command(String command, int max_time, char read_replay[], bool verbose=false);


void setup() {
  Serial.begin(9600);
  esp8266.begin(115200);
  send_command("AT",5,"OK");
  send_command("AT+CWMODE=1",5,"OK",true);
  send_command("AT+CWJAP=\""+ AP +"\",\""+ PASS +"\"",20,"OK",true);
}

void loop() {
  // put your main code here, to run repeatedly:

}

void send_command(String command, int max_time, char read_replay[], bool verbose=false) {
  while(count_time_command < max_time)
  {
    esp8266.println(command);//at+cipsend
    if(esp8266.find(read_replay))//ok
    {
      command_success = true;
      break;
    }
    
    count_time_command++;
  }
  
  if(command_success)
  {
    count_time_command = 0;

    if(verbose)
      {
        Serial.print("command success: ");
        Serial.println(command);
      }
  }
  
  if(command_success == false)
  {
    Serial.print("command fail: ");
    Serial.print(command);
    count_time_command = 0;
  }
  
  command_success = false;
 }

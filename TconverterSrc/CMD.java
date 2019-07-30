/**
 * This opens a command line and runs some other class in the jar
 * @author Brandon Barajas
 */
import java.io.*;
import java.awt.GraphicsEnvironment;
import java.net.URISyntaxException;
public class CMD {
    public static void main (String [] args) throws IOException{
        Console console = System.console();
        if(console == null && !GraphicsEnvironment.isHeadless()){
            String filename = CMD.class.getProtectionDomain().getCodeSource().getLocation().toString().substring(6);
            Runtime.getRuntime().exec(new String[]{"cmd","/c","start","cmd","/k","java -jar \"" + filename + "\""});
        }else{
            Main.main(new String[0]);
            System.out.println("Done!");
        }
    }
}
import java.io.*;
import java.util.Objects;

public class Main {

    public static void main(String[] args) {
        //delete old folders
        for (File fl : Objects.requireNonNull(new File("site").listFiles()))
            //make an exception for git
            if (fl.isDirectory() && !fl.getName().equals(".git"))
                //noinspection ResultOfMethodCallIgnored
                fl.delete();

        //create new folders
        for (File fl : Objects.requireNonNull(new File("database").listFiles()))
            if (fl.isDirectory())
                if (fl.getName().equals("maps")) new DirCrawler(fl, MapsData.class.getConstructors()[0]);
                else new DirCrawler(fl, TxtRead.class.getConstructors()[0]);
    }
}
